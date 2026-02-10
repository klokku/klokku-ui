import React, { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
type Icons = {
    // the name of the component
    name: string;
    // a more human-friendly name
    friendly_name: string;
    Component: React.FC<React.ComponentPropsWithoutRef<"svg">>;
};

export const useIconPicker = (): {
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    icons: Icons[];
} => {

    const icons: Icons[] = useMemo(
        () => {
            // Lucide exports icons as objects (React components) and some utilities
            // Icon names end without "Icon" suffix (e.g., "Activity")
            // Also exports with "Icon" suffix (e.g., "ActivityIcon") which are duplicates
            const excludedExports = ['createLucideIcon', 'Icon', 'icons', 'dynamicIconImports'];

            return Object.entries(LucideIcons)
                .filter(([name, value]) => {
                    // Filter out non-objects (icons are React component objects)
                    if (typeof value !== 'object' && typeof value !== 'function') return false;
                    // Filter out null values
                    if (value === null) return false;
                    // Filter out known utility exports
                    if (excludedExports.includes(name)) return false;
                    // Filter out exports that start with lowercase (utilities)
                    if (name[0] === name[0].toLowerCase()) return false;
                    // Skip duplicate exports ending with "Icon" (e.g., "ActivityIcon")
                    if (name.endsWith('Icon')) return false;
                    // Skip duplicate exports starting with "Lucide" (e.g., "LucideActivity")
                    if (name.startsWith('Lucide')) return false;
                    // Only include exports that start with uppercase (icon components)
                    return true;
                })
                .map(([iconName, IconComponent]) => ({
                    name: iconName,
                    // split the icon name at capital letters and join them with a space
                    friendly_name: iconName.match(/[A-Z][a-z]+/g)?.join(" ") ?? iconName,
                    Component: IconComponent as React.FC<React.ComponentPropsWithoutRef<"svg">>,
                }));
        },
        [],
    );

    // these lines can be removed entirely if you're not using the controlled component approach
    const [search, setSearch] = useState("");
    //   memoize the search functionality
    const filteredIcons = useMemo(() => {
        return icons.filter((icon) => {
            if (search === "") {
                return true;
            } else if (icon.name.toLowerCase().includes(search.toLowerCase())) {
                return true;
            } else {
                return false;
            }
        });
    }, [icons, search]);

    return { search, setSearch, icons: filteredIcons };
};

export const IconRenderer = ({
                                 icon,
                                 ...rest
                             }: {
    icon: string;
} & React.ComponentPropsWithoutRef<"svg">) => {
    const IconComponent = LucideIcons[icon as keyof typeof LucideIcons] as React.FC<React.ComponentPropsWithoutRef<"svg">>;

    if (!IconComponent) {
        return null;
    }

    return <IconComponent data-slot="icon" {...rest} />;
};
