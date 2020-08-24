<template>
  <b-field
    grouped
    group-multiline >
    <b-field expanded>
      <b-input
        v-model="search"
        icon-right="magnify" />
    </b-field>
    <b-field>
      <b-select
        v-model="result"
        placehoder="All sentences">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"> {{ option.label }} </option>
      </b-select>
    </b-field>
  </b-field>
</template>

<script>
export default {
  name: 'EvaluateResultExampleFilter',
  data() {
    return {
      search: null,
      result: null,
      options: [
        { label: 'All sentences', value: null },
        { label: 'Only right', value: 'right' },
        { label: 'Only wrong', value: 'wrong' },
      ],
    };
  },
  computed: {
    query() {
      return {
        ...(this.search && this.search.length > 0
          ? {
            search: this.search,
          } : {}),
        ...(this.result
          ? {
            result: this.result,
          } : {}),
      };
    },
  },
  watch: {
    query() {
      this.$emit('input', this.query);
    },
  },
};
</script>
