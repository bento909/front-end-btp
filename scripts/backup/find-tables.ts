// Resolves the exact per-deployment physical DynamoDB table name for every
// org-scoped model, by walking THIS deployment's own CloudFormation stack
// tree (root -> "data" nested stack -> each model's own per-model nested
// stack -> the Custom::AmplifyDynamoDBTable resource inside it).
//
// Deliberately never uses dynamodb:ListTables + a name-prefix guess — this
// AWS account runs both a sandbox and production, both with similarly-named
// tables, and that approach already silently wrote sandbox test data into
// the production table once (see BTP-16's writeup in Feature Requests.md).
// Same pattern already proven in amplify/functions/createOrganization/handler.ts,
// generalized here from one model to all of them.

import { CloudFormationClient, DescribeStackResourcesCommand } from "@aws-sdk/client-cloudformation";
import { fromIni } from "@aws-sdk/credential-providers";

// Amplify Hosting reuses the same CloudFormation root stack across deploys
// for a given branch — this name is stable long-term (an ordinary deploy
// updates the stack, it doesn't replace it). If it ever needs re-discovering:
//   aws cloudformation list-stacks --query "StackSummaries[?contains(StackName,'d276q2mvykjvwc-main-branch')]" --output table
// ...and take the shortest matching name (the one with no "-data<hash>-" or
// "NestedStack" segment — every nested stack's name is an extension of it).
export const ROOT_STACK_NAME = "amplify-d276q2mvykjvwc-main-branch-8773432c14";

export const MODEL_NAMES = ["Organization", "Plan", "PlanDay", "PlanExercise", "Exercise", "ExerciseLog", "ContactMessage"] as const;
export type ModelName = (typeof MODEL_NAMES)[number];

export function makeCfnClient(region: string, profile: string): CloudFormationClient {
    return new CloudFormationClient({ region, credentials: fromIni({ profile }) });
}

async function findNestedStack(cfn: CloudFormationClient, parentStackNameOrArn: string, logicalIdPrefix: string): Promise<string> {
    const resources = await cfn.send(new DescribeStackResourcesCommand({ StackName: parentStackNameOrArn }));
    const match = (resources.StackResources ?? []).find(
        (r) => r.ResourceType === "AWS::CloudFormation::Stack" && r.LogicalResourceId?.startsWith(logicalIdPrefix)
    );
    if (!match?.PhysicalResourceId) {
        throw new Error(`Could not find a nested stack starting with "${logicalIdPrefix}" under "${parentStackNameOrArn}"`);
    }
    // PhysicalResourceId for a nested AWS::CloudFormation::Stack resource is
    // the nested stack's own full ARN — DescribeStackResources accepts an
    // ARN as StackName just as well as a plain name.
    return match.PhysicalResourceId;
}

export async function findAllTableNames(cfn: CloudFormationClient): Promise<Record<ModelName, string>> {
    const dataStackArn = await findNestedStack(cfn, ROOT_STACK_NAME, "data");
    const result = {} as Record<ModelName, string>;
    for (const model of MODEL_NAMES) {
        const modelStackArn = await findNestedStack(cfn, dataStackArn, `amplifyData${model}NestedStack`);
        const resources = await cfn.send(new DescribeStackResourcesCommand({ StackName: modelStackArn }));
        const tableResource = (resources.StackResources ?? []).find((r) => r.ResourceType === "Custom::AmplifyDynamoDBTable");
        if (!tableResource?.PhysicalResourceId) {
            throw new Error(`Could not find the DynamoDB table for model "${model}"`);
        }
        result[model] = tableResource.PhysicalResourceId;
    }
    return result;
}
