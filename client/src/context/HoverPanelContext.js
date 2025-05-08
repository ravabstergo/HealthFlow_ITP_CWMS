import { createContext, useContext, useState } from "react";

// Create the context
const HoverPanelContext = createContext(null);

// Provider component
export function HoverPanelProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    title: "",
    content: null,
    shouldReset: false,
  });

  const openPanel = (title, content) => {
    setState({
      isOpen: true,
      title,
      content,
      shouldReset: false,
    });
  };

  const closePanel = (reset = false) => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      shouldReset: reset,
    }));

    // Optional: Clear content after animation completes
    if (reset) {
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          content: null,
        }));
      }, 300); // Match transition duration
    }
  };

  // Enhanced functionality to notify panel content about operation success
  const notifySuccess = (callback = null) => {
    // Close the panel first
    closePanel(true);

    // Execute the callback if provided (after panel closes)
    if (typeof callback === "function") {
      setTimeout(() => {
        callback();
      }, 300); // Match the transition duration
    }
  };

  return (
    <HoverPanelContext.Provider
      value={{
        ...state,
        openPanel,
        closePanel,
        notifySuccess,
      }}
    >
      {children}
    </HoverPanelContext.Provider>
  );
}

// Hook for components to use the panel
export const useHoverPanel = () => {
  const context = useContext(HoverPanelContext);
  if (!context) {
    throw new Error("useHoverPanel must be used within a HoverPanelProvider");
  }
  return context;
};
