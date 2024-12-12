<script lang="ts">
    const { to, children, underline = false, color = true } = $props()
</script>

<a href={to} class:text-blue-500={color} class:hover:underline={underline}>{@render children()}</a>