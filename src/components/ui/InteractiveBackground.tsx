"use client";

import React from "react";

const InteractiveBackground = () => {
    return (
        <div className="bg-animated">
            <div className="bg-grid" />
            <div className="bg-orb orb-a" />
            <div className="bg-orb orb-b" />
            <div className="bg-orb orb-c" />
        </div>
    );
};

export default InteractiveBackground;
