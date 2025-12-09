import * as React from "react";
import { cn } from "lib/utils";

/**
 * Internal prop names:
 * - tabValue : current active value
 * - setTab   : setter (function) — NOT starting with "on"
 *
 * We always destructure tabValue/setTab out of props before spreading into DOM.
 * 
 * Supports both controlled (value/onValueChange) and uncontrolled (defaultValue) modes.
 */

/* ROOT */
const Tabs = React.forwardRef(function Tabs(
  { className, defaultValue, value, onValueChange, children, ...props },
  ref
) {
  // Support both controlled and uncontrolled modes
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  
  // Determine if we're in controlled mode
  const isControlled = value !== undefined;
  const tabValue = isControlled ? value : internalValue;
  
  const setTab = React.useCallback((newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onValueChange) {
      onValueChange(newValue);
    }
  }, [isControlled, onValueChange]);

  // keep other props that *are* safe to pass to the root container
  // Remove any internal props that might accidentally be passed
  const { ...rootProps } = props;

  return (
    <div ref={ref} className={className} {...rootProps}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { tabValue, setTab })
          : child
      )}
    </div>
  );
});
Tabs.displayName = "Tabs";

/* TABS LIST */
const TabsList = React.forwardRef(function TabsList(
  { className, tabValue, setTab, children, ...props },
  ref
) {
  // Remove internal props before spreading to DOM
  const { tabValue: _tv, setTab: _st, ...cleanProps } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...cleanProps}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { tabValue, setTab })
          : child
      )}
    </div>
  );
});
TabsList.displayName = "TabsList";

/* TABS TRIGGER */
const TabsTrigger = React.forwardRef(function TabsTrigger(
  { className, value, tabValue, setTab, ...props },
  ref
) {
  const isActive = tabValue === value;

  // filter internal props from props (defensive)
  const { tabValue: _tv, setTab: _st, ...cleanProps } = props;

  return (
    <button
      ref={ref}
      onClick={() => setTab(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium",
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50",
        className
      )}
      {...cleanProps} // safe: no tabValue/setTab present
      type="button"
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

/* TABS CONTENT */
const TabsContent = React.forwardRef(function TabsContent(
  { className, value, tabValue, children, ...props },
  ref
) {
  if (tabValue !== value) return null;

  // ensure no internal props are forwarded
  const { tabValue: _tv, setTab: _st, ...cleanProps } = props;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...cleanProps}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
