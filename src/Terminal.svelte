<script>
  import {consoleCommand} from "./terminal"

  const DEFAULT_CONSOLE_INFO = `type :help to show commands. \n`
  const DEFAULT_TITLE = "~/svelte-terminal/index.js"

  export let title
  
  let show_terminal = true
  let minimize_terminal = false
  let maximize_terminal = false
  let max_style = ""

  let console_info = DEFAULT_CONSOLE_INFO
  let input_value = ""

  onLoad()

  function onLoad(){
    if(!title) title = DEFAULT_TITLE
  }

  function onCloseClick(){
    closeWin()
  }

  function onKeyDown(e){
    if(e.key === "Enter"){
      console_info += ">" + input_value // include enter(\n)
      console_info += consoleCommand(input_value, closeWin)
      input_value = ""
    }
  }

  function closeWin(){
    show_terminal = false
    console_info = DEFAULT_CONSOLE_INFO
    input_value = ""
  }

  function onMinimizeWin(){
    minimize_terminal = !minimize_terminal 
  }

  function onMaximizeWin(){
    maximize_terminal = !maximize_terminal
    if(maximize_terminal){
      max_style = "position: fixed; top: 0; left: 0;"
    }
    else{
      max_style = ""
    }
  }

</script>

{#if show_terminal}
  <div class="terminal" style={max_style}>
    <div class="header">
      <span class="bullet bullet-red" on:click={onCloseClick}></span>
      <span class="bullet bullet-yellow" on:click={onMinimizeWin}></span>
      <span class="bullet bullet-green" on:click={onMaximizeWin}></span>
      <span class="title">{title}</span>
    </div>
    {#if minimize_terminal === false}
      <div class="window">
        <pre>
          {console_info}
        </pre>
        <div class="terminal-prompt" >
            <!-- svelte-ignore a11y-autofocus -->
            <textarea class="cli" rows="2" on:keyup={onKeyDown} bind:value={input_value} autofocus></textarea>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>

  /*https://socket.io/*/
  .terminal{
    background-color: rgba(156, 163, 175, 0.7);
    width: 100%;
    height: 100%;
    text-align: left;
    font-family: consolas,monospace,Monaco,Menlo,"Space Mono";
    border-radius: .25rem;
  }
  .header{
    background: #e8e8e8;
    border-radius: 4px 4px 0 0;
    padding: 3px 1rem;
  }
  .header .bullet{
    height: 11px;
    width: 11px;
    display: inline-block;
    background: #ccc;
    border-radius: 100%;
    vertical-align: middle;
    margin-right: 5px;
  }
  .header .bullet-red:hover{
    background: #ee4334;
  }
  .header .bullet-yellow:hover{
    background: #F59E0B;
  }
  .header .bullet-green:hover{
    background: #10B981;
  }
  .header .bullet-red{
    background: #df7065;
  }
  .header .bullet-yellow{
    background: #e6bb46;
  }
  .header .bullet-green{
    background: #5bcc8b;
  }
  .window{
    overflow-y: scroll;
    padding: 0.5rem;
    background-color: rgba(8, 8, 8, 0.5);
    height: 100%;
    color: #e8e8e8;
  }
  .window pre{
    font-family: inherit;
    margin : 0px;
  }

  /*--primary-color: #1a95e0;
  //https://terminalcss.xyz/dark/#*/
  .terminal-prompt{
    display: flex;
  }
  /*https://jsconsole.com/*/
  .terminal-prompt .cli{
    overflow-y: hidden;
    color: #dedede;
    resize: none;
    background: none;
    font-family: inherit;
    border: 0;
    display: inline-block;
    width: 100%;
    outline: none;
    font-size: inherit;
    line-height: inherit;
    margin: 0;
    padding: 0;
  }
  .terminal-prompt::before {
    font-family: inherit;
    content: ">";
  }
</style>