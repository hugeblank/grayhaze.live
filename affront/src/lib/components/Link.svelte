<script lang="ts">
    const { to, children } = $props()
</script>

<a href={to} class="text-blue-500 hover:underline">{@render children()}</a>