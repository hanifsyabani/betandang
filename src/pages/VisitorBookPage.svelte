<script lang="ts">
  import HeaderPage from "../components/common/header-page.svelte";
  import FormVisitorBook from "../components/visitor-book/form-visitor-book.svelte";
</script>

<HeaderPage title="Buku Tamu"  />
<section class="bg-base py-10 md:py-14">
  <div class="page-container">
    <div class="mx-auto max-w-3xl">
      <FormVisitorBook />
    </div>
  </div>
</section>
