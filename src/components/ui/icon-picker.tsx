import React, { useMemo, useState } from "react";
import * as LucideIcons from "lucide-react";
import iconTags from "lucide-static/tags.json";

type Icons = {
    // the name of the component
    name: string;
    // a more human-friendly name
    friendly_name: string;
    Component: React.FC<React.ComponentPropsWithoutRef<"svg">>;
    tags: string[];
};

// Convert PascalCase to kebab-case for tag lookup
const toKebabCase = (str: string): string => {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
};

// Popular icons for time tracking activities
const POPULAR_ICONS = [
    'Activity', 'Briefcase', 'Calendar', 'Clock', 'Coffee', 'Computer', 'Laptop',
    'Car', 'Bus', 'Train', 'Bicycle', 'Plane', 'Home', 'Building',
    'Pizza', 'UtensilsCrossed', 'Cake', 'Apple', 'Sandwich', 'Salad',
    'Gamepad2', 'Tv', 'Music', 'Book', 'Dumbbell', 'ShoppingBag',
    'Users', 'User', 'Heart', 'Star', 'Zap', 'Target', 'TrendingUp',
    'Phone', 'MessageSquare', 'Mail', 'FileText', 'Folder', 'Package',
    'ShoppingCart', 'CreditCard', 'DollarSign', 'Wallet',
    'Sun', 'Moon', 'Cloud', 'Umbrella', 'Snowflake',
    'Camera', 'Film', 'Headphones', 'Mic', 'Video',
    'Palette', 'Paintbrush', 'Scissors', 'Wrench', 'Settings'
];

export const useIconPicker = (): {
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
    icons: Icons[];
} => {

    const allIcons: Icons[] = useMemo(
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
                .map(([iconName, IconComponent]) => {
                    const kebabName = toKebabCase(iconName);
                    const tags = (iconTags as Record<string, string[]>)[kebabName] || [];

                    return {
                        name: iconName,
                        // split the icon name at capital letters and join them with a space
                        friendly_name: iconName.match(/[A-Z][a-z]+/g)?.join(" ") ?? iconName,
                        Component: IconComponent as React.FC<React.ComponentPropsWithoutRef<"svg">>,
                        tags: tags,
                    };
                });
        },
        [],
    );

    const [search, setSearch] = useState("");

    // Filter and limit icons based on search
    const filteredIcons = useMemo(() => {
        if (search === "") {
            // Show only popular icons when no search term
            return allIcons.filter(icon => POPULAR_ICONS.includes(icon.name));
        }

        // When searching, show matching icons (limit to 100 for performance)
        const searchLower = search.toLowerCase();
        return allIcons
            .filter((icon) => {
                // Match by icon name
                if (icon.name.toLowerCase().includes(searchLower)) return true;
                // Match by friendly name
                if (icon.friendly_name.toLowerCase().includes(searchLower)) return true;
                // Match by tags (synonyms)
                if (icon.tags.some(tag => tag.toLowerCase().includes(searchLower))) return true;
                return false;
            })
            .slice(0, 100);
    }, [allIcons, search]);

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
