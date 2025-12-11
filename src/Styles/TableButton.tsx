import React from "react";

interface TableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

const TableButton: React.FC<TableButtonProps> = ({ label, ...props }) => {
    return (
        <button
            {...props}
            style={{
                padding: "2px 6px",
                marginLeft: "4px",
                fontSize: "12px",
                borderRadius: "4px",
                cursor: "pointer",
                ...props.style,
            }}
        >
            {label}
        </button>
    );
};

export default TableButton;
