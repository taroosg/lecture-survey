import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import React from "react";

// Add jest-dom matchers to vitest expect
expect.extend(matchers);

// Make React available globally for JSX tests
global.React = React;
