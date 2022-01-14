import Terminal from './Terminal.svelte';
const app = new Terminal({
    target: document.body,
    props: {
      // name: 'world'
    },
  });
  
  export default app;