const HELP_INFO = `HELP INFO
type following commands to use console.
:help help
:about about this console
:exit exit console `
const ABOUT_INFO = `this is a console by candy water. ver 0.0.1
visit https://github.com/candywater/svelte-terminal/ for more info. `
const EXIT_INFO = `have a nice day! `
const ERROR_INFO = `command not found. Type :help for help. `

export function consoleCommand(input, closeWin = ()=>{}){
  let str = input.trim();
  switch (str) {
    case ":help":
    case "help":
      return HELP_INFO
    case ":about":
    case "about":
      return ABOUT_INFO 
    case ":exit":
    case "exit":
      setTimeout(closeWin, 350);
      return EXIT_INFO
    default:
      return ERROR_INFO
  }
}