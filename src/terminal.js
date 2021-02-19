const HELP_INFO = `HELP INFO
type following commands to use console.
:help help
:about about this console
:exit exit console
`
const ABOUT_INFO = `this is a console by candy water. ver 0.0.1
visit https://github.com/candywater/svelte-terminal/ for more info.
`
const EXIT_INFO = `have a nice day!
`
const ERROR_INFO = `command not found. Type :help for help.
`

export function consoleCommand(input, console_info, show_terminal = true){
  let str = input.trim();
  switch (str) {
    case ":help":
    case "help":
      return console_info + HELP_INFO
    case ":about":
    case "about":
      return console_info + ABOUT_INFO 
    case ":exit":
    case "exit":
      // setTimeout(() => {
      //   show_terminal = false;
      // }, 350);
      return console_info + EXIT_INFO
    default:
      return console_info + ERROR_INFO
  }
}