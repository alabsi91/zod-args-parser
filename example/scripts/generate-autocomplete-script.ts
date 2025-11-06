import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  generateBashAutocompleteScript,
  generatePowerShellAutocompleteScript,
  generateZshAutocompleteScript,
} from "../../src/index.ts";
import { listCli } from "../cli.ts";

const outdir = path.join(import.meta.dirname, "..", "autocomplete-scripts");

/*
- Generate bash autocomplete script for `listy`.
- The generated script should be added to user `.bash_profile` or `.bashrc` file:
  - Run: `nano $HOME/.bash_profile` or `nano $HOME/.bashrc`
  - Add the following line: `source <path to listy-autocomplete.sh>`
  - Save and reopen bash to take effect
*/
const bashScript = generateBashAutocompleteScript(listCli);
writeFileSync(path.join(outdir, "bash-autocomplete.sh"), bashScript, { encoding: "utf8" });

/*
- Generates a PowerShell autocomplete script for `listy`.
- The script assumes that the CLI is available as a `listy.ps1` file in the environment variable. 
- The following should return a path: `(Get-Command listy.ps1).Source`
- The generated script should be added to user `profile.ps1` file:
    - Run: `notepad $profile`
    - Add the following line: `. "<path to listy-autocomplete.ps1>"`
    - Save and reopen powershell to take effect
*/
const powershellScript = generatePowerShellAutocompleteScript(listCli);
writeFileSync(path.join(outdir, "powershell-autocomplete.ps1"), powershellScript, { encoding: "utf8" });

/**
 * - Generates a ZSH autocomplete script for your CLI.
 * - The generated script should be added to your `~/.zshrc` or `~/.zsh_profile` file:
 *
 *   - Run: `nano $HOME/.zshrc` or `nano $HOME/.zsh_profile`
 *   - Add the following line: `source <generated script path>`
 *   - Save and reopen zsh to take effect
 */
const zshScript = generateZshAutocompleteScript(listCli);
writeFileSync(path.join(outdir, "zsh-autocomplete.zsh"), zshScript, { encoding: "utf8" });
