import { transformOptionToArg } from "./utils.js";

import type { Cli, Subcommand } from "./types.js";

/**
 * - Generate bash autocomplete script for your CLI
 * - The generated script should be added to your `.bash_profile` or `.bashrc` file:
 *
 *   - Run: `nano $HOME/.bash_profile` or `nano $HOME/.bashrc`
 *   - Add the following line: `source <generated script path>`
 *   - Save and reopen bash to take effect
 */
export function generateBashAutocompleteScript(...params: [Cli, ...Subcommand[]]): string {
  const [cli, ...subcommands] = params;

  type MappedCommands = Record<string, { options: string[]; aliases: string[] }>;

  const mappedCommands = subcommands.reduce((acc: MappedCommands, subcommand) => {
    acc[subcommand.name] = {
      options: subcommand.options?.map(option => transformOptionToArg(option.name)) ?? [],
      aliases: subcommand.aliases ?? [],
    };
    return acc;
  }, {});

  let switchCase = "";
  for (const [key, { options, aliases }] of Object.entries(mappedCommands)) {
    switchCase += `    ${key}${aliases.length ? "|" : ""}${aliases.join("|")})\n`;
    switchCase += `      opts="${options.join(" ")}"\n`;
    switchCase += "      ;;\n";
  }

  if (cli.options?.length) {
    switchCase += `    "-"*)\n`;
    switchCase += `      opts="${cli.options.map(option => transformOptionToArg(option.name)).join(" ")}"\n`;
    switchCase += "      ;;\n";
  }

  return `_${cli.cliName}_autocomplete() {
  local cur prev commands opts subcommand used_opts filtered_opts

  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  subcommand="\${COMP_WORDS[1]}"

  commands="${Object.keys(mappedCommands).join(" ")}"

  case "$subcommand" in
${switchCase}
  esac

  used_opts=""
  if [[ " \${commands[@]} " =~ " $subcommand " ]]; then
    for word in "\${COMP_WORDS[@]:2}"; do
      if [[ "$word" =~ ^- ]]; then
        used_opts+=" $word"
      fi
    done
  fi

  if [[ -n "$opts" ]]; then
    filtered_opts=""
    for opt in $opts; do
      if [[ ! " $used_opts " =~ " $opt " ]]; then
        filtered_opts+="$opt "
      fi
    done
    COMPREPLY=( $(compgen -W "$filtered_opts" -- "$cur") )
    return
  fi

  if [[ "\${COMP_CWORD}" -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "$commands" -- "$cur") )
  fi
}

complete -F _${cli.cliName}_autocomplete ${cli.cliName}
`;
}

/**
 * - Generates a PowerShell autocomplete script for your CLI.
 * - The script assumes that your CLI is available as a `.ps1` file in the environment variable. For example:
 *   `cliName.ps1`.
 * - This should return a path to your script: `(Get-Command <cliName>.ps1).Source`
 * - The generated script should be added to your `profile.ps1` file:
 *
 *   - Run: `notepad $profile`
 *   - Add the following line: `. "<generated script path>"`
 *   - Save and reopen powershell to take effect
 */
export function generatePowerShellAutocompleteScript(...params: [Cli, ...Subcommand[]]): string {
  const [cli, ...subcommands] = params;

  type MappedCommands = Record<string, { options: string[]; aliases: string[] }>;

  const mappedCommands = subcommands.reduce((acc: MappedCommands, subcommand) => {
    acc[subcommand.name] = {
      options: subcommand.options?.map(option => transformOptionToArg(option.name)) ?? [],
      aliases: subcommand.aliases ?? [],
    };
    return acc;
  }, {});

  const subcommandsStr = Object.keys(mappedCommands)
    .map(key => `'${key}'`)
    .join(", ");
  const cliOptionsStr = cli.options?.map(option => `'${transformOptionToArg(option.name)}'`).join(", ") || "";

  let switchCase = "switch ($subcommand) {\n";
  for (const [key, { options, aliases }] of Object.entries(mappedCommands)) {
    const optionsStr = options.map(option => `'${option}'`).join(", ");
    switchCase += `        '${key}' { @(${optionsStr}) }\n`;
    aliases.forEach(a => (switchCase += `        '${a}' { @(${optionsStr}) }\n`));
  }
  switchCase += `        default { @(${cliOptionsStr}) }\n    }`;

  let functionInfo = "";
  if (cli.description) {
    functionInfo = `<#\n.DESCRIPTION\n${cli.description}\n${cli.example ? `\n.EXAMPLE\n${cli.example}` : ""}\n#>`;
  }

  return `${functionInfo}
function ${cli.cliName} {
    param(
        [Parameter(Position = 0, Mandatory = $false)]
        [string]$subcommand,
        [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
        [string[]]$arguments
    )
    $scriptPath = (Get-Command '${cli.cliName}.ps1').Source
    if ($scriptPath) {
        $argumentList = @($subcommand) + ($arguments | Where-Object { $_ -notin '--', '--%' }) | Where-Object { $_ -ne '' }
        & $scriptPath @argumentList
        return
    }
    Write-Error "Could not find '${cli.cliName}.ps1' script"
}

Register-ArgumentCompleter -CommandName '${cli.cliName}' -ParameterName 'subcommand' -ScriptBlock {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    $subcommands = @(${subcommandsStr}${subcommandsStr && cliOptionsStr ? ", " : ""}${cliOptionsStr})
    $subcommands | Where-Object { $_ -like "$wordToComplete*" }
}

Register-ArgumentCompleter -CommandName '${cli.cliName}' -ParameterName 'arguments' -ScriptBlock {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)
    $subcommand = $commandAst.CommandElements[1].Value
    $arguments = ${switchCase}
    $arguments | Where-Object { $_ -like "$wordToComplete*" }
}`;
}
