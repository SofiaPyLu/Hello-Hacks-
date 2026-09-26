import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	layout("routes/dashboard.tsx", [
		index("routes/home.tsx"),
		route(":section", "routes/section.tsx"),
	]),
] satisfies RouteConfig;
