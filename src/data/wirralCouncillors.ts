export interface Councillor {
    name: string;
    email: string;
    party: string;
}

// Scraped from https://democracy.wirral.gov.uk/mgMemberIndex.aspx?FN=WARD&VW=TABLE&PIC=1 on 2026-09-10 by scripts/refresh-councillors.ts.
// Run `npm run councillors:refresh` to regenerate this file when the council's
// data changes (an "unknown ward" result on the Write to Your Councillor page
// is a sign it's gone stale - elections/by-elections change this list).
export const WIRRAL_COUNCILLORS_BY_WARD: Record<string, Councillor[]> = {
    "Bebington": [
        { name: "Judith Grier", email: "judithgrier@wirral.gov.uk", party: "Green Party" },
        { name: "Ed Lamb", email: "edlamb@wirral.gov.uk", party: "Green Party" },
        { name: "Jason Walsh-McDonald", email: "jasonwalshmcdonald@wirral.gov.uk", party: "Green Party" },
    ],
    "Bidston and St. James": [
        { name: "Elizabeth Grey", email: "elizabethgrey@wirral.gov.uk", party: "Labour" },
        { name: "Brian Kenny", email: "briankenny@wirral.gov.uk", party: "Labour" },
        { name: "Julie McManus", email: "juliemcmanus@wirral.gov.uk", party: "Labour" },
    ],
    "Birkenhead and Tranmere": [
        { name: "Pat Cleary", email: "patcleary@wirral.gov.uk", party: "Green Party" },
        { name: "Amanda Onwuemene", email: "amandaonwuemene@wirral.gov.uk", party: "Green Party" },
        { name: "Ewan Tomeny", email: "ewantomeny@wirral.gov.uk", party: "Green Party" },
    ],
    "Bromborough": [
        { name: "Jo Bird", email: "jobird@wirral.gov.uk", party: "Green Party" },
        { name: "Ruth Molyneux", email: "ruthmolyneux@wirral.gov.uk", party: "Green Party" },
        { name: "Kieran Murphy", email: "kieranmurphy@wirral.gov.uk", party: "Green Party" },
    ],
    "Clatterbridge": [
        { name: "Helen Cameron", email: "helencameron@wirral.gov.uk", party: "Conservative" },
        { name: "Mary Jordan", email: "maryjordan@wirral.gov.uk", party: "Conservative" },
        { name: "Cherry Povall MBE JP", email: "cherrypovall@wirral.gov.uk", party: "Conservative" },
    ],
    "Claughton": [
        { name: "George Davies", email: "georgedavies@wirral.gov.uk", party: "Labour" },
        { name: "Steve Foulkes", email: "stevefoulkes@wirral.gov.uk", party: "Labour" },
        { name: "Gillian Wood", email: "gillianwood@wirral.gov.uk", party: "Labour and Co-operative" },
    ],
    "Eastham": [
        { name: "Chris Carubia", email: "christophercarubia@wirral.gov.uk", party: "Liberal Democrats" },
        { name: "Phil Gilchrist", email: "philgilchrist@wirral.gov.uk", party: "Liberal Democrats" },
        { name: "Helen Raymond", email: "helenraymond@wirral.gov.uk", party: "Liberal Democrats" },
    ],
    "Greasby, Frankby and Irby": [
        { name: "Gail Jenkinson", email: "gailjenkinson@wirral.gov.uk", party: "Green Party" },
        { name: "Grahame McManus", email: "grahamemcmanus@wirral.gov.uk", party: "Labour" },
        { name: "Mark Skillicorn", email: "markskillicorn@wirral.gov.uk", party: "Labour" },
    ],
    "Heswall": [
        { name: "Graham Davies", email: "grahamdavies3@wirral.gov.uk", party: "Reform UK" },
        { name: "Andrew Hodson", email: "andrewhodson@wirral.gov.uk", party: "Reform UK" },
        { name: "Kathy Hodson", email: "kathyhodson@wirral.gov.uk", party: "Reform UK" },
    ],
    "Hoylake and Meols": [
        { name: "Max Booth", email: "maxbooth@wirral.gov.uk", party: "Conservative" },
        { name: "Tony Cox", email: "tonycox@wirral.gov.uk", party: "Conservative" },
        { name: "Andrew Gardner", email: "andrewgardner@wirral.gov.uk", party: "Conservative" },
    ],
    "Leasowe and Moreton East": [
        { name: "Angela Davies", email: "angeladavies@wirral.gov.uk", party: "Labour" },
        { name: "Paul Jobson", email: "pauljobson@wirral.gov.uk", party: "Labour" },
        { name: "Louise Luxon-Kewley", email: "louiseluxonkewley@wirral.gov.uk", party: "Labour" },
    ],
    "Liscard": [
        { name: "Graeme Cooper", email: "graemecooper@wirral.gov.uk", party: "Labour" },
        { name: "James Stewart Laing", email: "jameslaing@wirral.gov.uk", party: "Labour and Co-operative" },
        { name: "Janette Williamson", email: "janwilliamson@wirral.gov.uk", party: "Labour" },
    ],
    "Moreton West and Saughall Massie": [
        { name: "Colin Baldwin", email: "colinbaldwin@wirral.gov.uk", party: "Conservative" },
        { name: "Gary Bennett", email: "garybennett@wirral.gov.uk", party: "Conservative" },
        { name: "Vida Wilson", email: "vidawilson@wirral.gov.uk", party: "Conservative" },
    ],
    "New Brighton": [
        { name: "Tony Jones MBE", email: "tonyjones@wirral.gov.uk", party: "Independent" },
        { name: "Paul Martin", email: "paulmartin1@wirral.gov.uk", party: "Labour" },
        { name: "Sue Powell-Wilde", email: "suepowellwilde@wirral.gov.uk", party: "Labour" },
    ],
    "Oxton": [
        { name: "Allan Brame", email: "allanbrame@wirral.gov.uk", party: "Liberal Democrats" },
        { name: "Stuart Kelly", email: "stuartkelly@wirral.gov.uk", party: "Liberal Democrats" },
        { name: "Mike Redfern", email: "mikeredfern@wirral.gov.uk", party: "Liberal Democrats" },
    ],
    "Pensby and Thingwall": [
        { name: "Ann Ainsworth", email: "annainsworth@wirral.gov.uk", party: "Labour" },
        { name: "Richie Pitt", email: "richiepitt@wirral.gov.uk", party: "Independent" },
        { name: "Mike Sullivan", email: "mikesullivan@wirral.gov.uk", party: "Labour" },
    ],
    "Prenton": [
        { name: "Christopher Cooke", email: "chriscooke@wirral.gov.uk", party: "Green Party" },
        { name: "Harry Gorman", email: "harrygorman@wirral.gov.uk", party: "Green Party" },
        { name: "Naomi Graham", email: "naomigraham@wirral.gov.uk", party: "Green Party" },
    ],
    "Rock Ferry": [
        { name: "Paula Basnett", email: "paulabasnett@wirral.gov.uk", party: "Labour" },
        { name: "Tony Murphy", email: "tonymurphy@wirral.gov.uk", party: "Labour" },
        { name: "Craig Walsh-McDonald", email: "craigmcdonald@wirral.gov.uk", party: "Green Party" },
    ],
    "Seacombe": [
        { name: "Tom Laing", email: "tomlaing@wirral.gov.uk", party: "Labour and Co-operative" },
        { name: "Kaitlin Stuart", email: "kaitlinstuart@wirral.gov.uk", party: "Labour" },
        { name: "Paul Stuart", email: "paulstuart@wirral.gov.uk", party: "Labour" },
    ],
    "Upton": [
        { name: "Stephen Bennett", email: "stephenbennett@wirral.gov.uk", party: "Labour" },
        { name: "Jean Robinson", email: "jeanrobinson@wirral.gov.uk", party: "Independent" },
        { name: "Jerry Williams", email: "jerrywilliams@wirral.gov.uk", party: "Labour" },
    ],
    "Wallasey": [
        { name: "Brenda Hall", email: "brendahall@wirral.gov.uk", party: "Labour" },
        { name: "Ian Lewis", email: "ianlewis@wirral.gov.uk", party: "Conservative" },
        { name: "Lesley Rennie", email: "lesleyrennie@wirral.gov.uk", party: "Conservative" },
    ],
    "West Kirby and Thurstaston": [
        { name: "Jeff Green", email: "jeffgreen@wirral.gov.uk", party: "Conservative" },
        { name: "Jennifer Johnson", email: "jennyjohnson2@wirral.gov.uk", party: "Conservative" },
        { name: "Simon R Mountney", email: "simonmountney@wirral.gov.uk", party: "Conservative" },
    ],
};

const normalizeWardName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[.,]/g, " ")
        .replace(/\band\b/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const NORMALIZED_WARD_LOOKUP: Record<string, Councillor[]> = Object.fromEntries(
    Object.entries(WIRRAL_COUNCILLORS_BY_WARD).map(([ward, councillors]) => [normalizeWardName(ward), councillors])
);

export const findCouncillorsByWard = (wardName: string): Councillor[] | null =>
    NORMALIZED_WARD_LOOKUP[normalizeWardName(wardName)] ?? null;
