import React from "react";
import { createRoot } from "react-dom/client";
import { UadiPrototype } from "./index.js";
import type { UdsSpecification } from "./types.js";
import spec from "./minimal-uds.json";
import "./styles.css";
const host = document.getElementById("root");
if (!host) throw new Error("Prototype root element is missing");
createRoot(host).render(<React.StrictMode><UadiPrototype spec={spec as UdsSpecification} /></React.StrictMode>);
