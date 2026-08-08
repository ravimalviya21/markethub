import { ReactNode } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbProps } from "antd";

import { Category } from "@/services/category.service";

export interface Crumb {
    label: ReactNode;
    href?: string;
}

export interface BreadcrumbsProps extends Omit<BreadcrumbProps, "items"> {
    items: Crumb[];
}

export const categoryCrumbs = (path: Category[], basePath = "/buyer/products"): Crumb[] =>
    path.map((category) => ({
        label: category.displayName,
        href: `${basePath}?categoryId=${category.id}`,
    }));

const Breadcrumbs = ({ items, style, ...rest }: BreadcrumbsProps) => (
    <Breadcrumb
        {...rest}
        style={{ marginBottom: 16, ...style }}
        items={items.map((crumb, index) => ({
            title:
                crumb.href && index < items.length - 1 ? (
                    <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                    crumb.label
                ),
        }))}
    />
);

export default Breadcrumbs;
