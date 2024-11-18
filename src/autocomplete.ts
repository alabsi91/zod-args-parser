import { transformOptionToArg } from "./utils.js";

import type { Cli, Subcommand } from "./types.js";

/** - Generate bash autocomplete script for your CLI */
export function generateAutocompleteScript(...params: [Cli, ...Subcommand[]]): string {
  const [cli, ...subcommands] = params;

  const commandName = cli.cliName;
  const commands = subcommands.map(subcommand => subcommand.name);
  const commandOptions = subcommands.reduce((acc: Record<string, string[]>, subcommand) => {
    if (!subcommand.name || !subcommand.options?.length) return acc;
    acc[subcommand.name] = subcommand.options.map(option => transformOptionToArg(option.name));
    return acc;
  }, {});

  let switchCase = "";
  for (const [key, value] of Object.entries(commandOptions)) {
    switchCase += `    ${key}|${key[0]})\n`;
    switchCase += `      opts="${value.join(" ")}"\n`;
    switchCase += "      ;;\n";
  }

  if (cli.options?.length) {
    switchCase += `    "-"*)\n`;
    switchCase += `      opts="${cli.options.map(option => transformOptionToArg(option.name)).join(" ")}"\n`;
    switchCase += "      ;;\n";
  }

  return `_${commandName}_autocomplete() {
  local cur prev commands opts subcommand used_opts filtered_opts

  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  subcommand="\${COMP_WORDS[1]}"

  commands="${commands.join(" ")}"

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

complete -F _${commandName}_autocomplete ${commandName}
`;
}
