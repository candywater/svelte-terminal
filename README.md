### svelte-terminal

this is a terminal-like html console window.
you can write your own command.

[LIVE DEMO HERE](https://candywater.github.io/svelte-terminal/)

#### screenshot

![screenshot](./assets/screenshot_v0.0.0.png)

### install 

```
pnpm add candywater/svelte-terminal#0.0.3
```

### todo list

- [x] round layout
- [] customize theme
- [x] customize title
- [x] customize command
- [x] fix layout
- [x] fix font
- [x] fix input shake issue
- [] add hightlight if possible
- [] draggble
- [] mini size
- [x] customize close function



### how to use

```js
<script>
  import Terminal from "svelte-terminal"
</script>
<Terminal></Terminal>
```

or you can set your own title, and commands ...

```js
<script>
  function command(input, close){
    if(input == ":about") return "this is a teapot!"
    else return "I don't understand cause I'm a teapot!"
  }
</script>
<Terminal 
  title="your_title" 
  consoleCommand={command}
  fontsize="0.85rem"
  fontfamily="Monaco"
  exactClose={()=>{}}
/>
```

### write your own command

your command function should looks like this

```js
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
```