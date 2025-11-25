<template>
  <div />
</template>

<script>
export default {
  name: 'LonganMapRedirect',
  mounted () {
    // Redirect to the static HTML placed in /public
    if (typeof window !== 'undefined') {
      window.location.href = '/longan_map.html'
    }
  }
}
</script>
