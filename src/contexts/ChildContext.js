import React, { createContext, useContext, useState } from "react";

const ChildContext = createContext();

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error("useChildContext must be used within a ChildProvider");
  }
  return context;
};

export const ChildProvider = ({ children }) => {
  const [currentChildId, setCurrentChildId] = useState(null);

  const value = {
    currentChildId,
    setCurrentChildId,
  };

  return (
    <ChildContext.Provider value={value}>{children}</ChildContext.Provider>
  );
};
