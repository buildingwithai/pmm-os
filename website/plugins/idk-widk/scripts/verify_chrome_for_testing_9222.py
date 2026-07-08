#!/usr/bin/env python3
import json
import subprocess
import sys
import urllib.request


def read_devtools_version():
    with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=3) as response:
        return json.loads(response.read().decode("utf-8"))


def port_process_commands():
    try:
        output = subprocess.check_output(
            ["lsof", "-nP", "-iTCP:9222", "-sTCP:LISTEN"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except subprocess.CalledProcessError:
        return []

    commands = []
    for line in output.splitlines()[1:]:
        parts = line.split()
        if len(parts) < 2:
            continue
        pid = parts[1]
        try:
            command = subprocess.check_output(["ps", "-p", pid, "-o", "command="], text=True).strip()
        except subprocess.CalledProcessError:
            continue
        commands.append(command)
    return commands


def main():
    try:
        version = read_devtools_version()
    except Exception as exc:
        print(f"Chrome DevTools endpoint is not reachable at http://127.0.0.1:9222: {exc}", file=sys.stderr)
        return 1

    commands = port_process_commands()
    command_text = "\n".join(commands)
    if "Google Chrome for Testing" not in command_text:
        print("Port 9222 is reachable, but it does not appear to be owned by Chrome for Testing.", file=sys.stderr)
        print("Close or move the process using 9222, then launch Chrome for Testing for agent browser work.", file=sys.stderr)
        if command_text:
            print("\nProcess command using 9222:", file=sys.stderr)
            print(command_text, file=sys.stderr)
        return 2

    print("Chrome for Testing DevTools endpoint OK")
    print(f"Browser: {version.get('Browser', 'unknown')}")
    print("DevTools socket: http://127.0.0.1:9222")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
