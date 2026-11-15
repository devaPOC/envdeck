export function EnvDiff(): JSX.Element {
  // TODO: let user pick two servers + a file path, fetch both via sftp.readFile, render a side-by-side diff
  return <div className="p-3 text-sm text-neutral-400">Select two servers to diff a file</div>
}
