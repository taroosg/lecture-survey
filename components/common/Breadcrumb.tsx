"use client";

import Link from "next/link";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({
  items,
  className = "",
}: BreadcrumbProps): React.ReactElement {
  if (items.length === 0) {
    return <></>;
  }

  return (
    <nav
      role="navigation"
      aria-label="Breadcrumb"
      className={`mb-4 flex items-center text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="mx-2" aria-hidden="true">
              /
            </span>
          )}
          {item.current || !item.href ? (
            <span
              className="text-gray-900 dark:text-gray-100"
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:underline focus:underline focus:outline-none"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
