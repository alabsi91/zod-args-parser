import { writeFile } from "fs/promises";
import {
  generateBashAutocompleteScript,
  generatePowerShellAutocompleteScript,
  generateZshAutocompleteScript,
} from "zod-args-parser";

import { cliSchemas } from "./cli.ts";

/*
- Generate bash autocomplete script for `argplay`.
- The generated script should be added to user `.bash_profile` or `.bashrc` file:
  - Run: `nano $HOME/.bash_profile` or `nano $HOME/.bashrc`
  - Add the following line: `source <path to argplay-autocomplete.sh>`
  - Save and reopen bash to take effect
*/
const bashScript = generateBashAutocompleteScript(...cliSchemas);
await writeFile("./bash-autocomplete.sh", bashScript, { encoding: "utf-8" });

/*
- Generates a PowerShell autocomplete script for `argplay`.
- The script assumes that the CLI is available as a `argplay.ps1` file in the environment variable. 
- The following should return a path: `(Get-Command argplay.ps1).Source`
- The generated script should be added to user `profile.ps1` file:
    - Run: `notepad $profile`
    - Add the following line: `. "<path to argplay-autocomplete.ps1>"`
    - Save and reopen powershell to take effect
*/
const powershellScript = generatePowerShellAutocompleteScript(...cliSchemas);
await writeFile("./powershell-autocomplete.ps1", powershellScript, { encoding: "utf-8" });

/**
 * - Generates a ZSH autocomplete script for your CLI.
 * - The generated script should be added to your `~/.zshrc` or `~/.zsh_profile` file:
 *
 *   - Run: `nano $HOME/.zshrc` or `nano $HOME/.zsh_profile`
 *   - Add the following line: `source <generated script path>`
 *   - Save and reopen zsh to take effect
 */
const zshScript = generateZshAutocompleteScript(...cliSchemas);
await writeFile("./zsh-autocomplete.zsh", zshScript, { encoding: "utf-8" });
