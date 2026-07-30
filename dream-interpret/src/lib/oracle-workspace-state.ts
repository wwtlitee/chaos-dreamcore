export type OracleWorkspaceMode = "form" | "report";
export type OracleWorkspaceEvent = "submit" | "success" | "failure" | "retry";

export function reduceOracleWorkspaceMode(
  currentMode: OracleWorkspaceMode,
  event: OracleWorkspaceEvent,
): OracleWorkspaceMode {
  if (event === "success") return "report";
  if (event === "failure" || event === "retry") return "form";
  return currentMode;
}
