<template>
  <div>
    <b-field
      grouped
      group-multiline >
      <b-field expanded>
        <b-input
          v-model="search"
          icon-right="magnify" />
      </b-field>
      <b-field>
        <b-autocomplete
          v-model="intent"
          :data="intents"
          placeholder="Intent"
          open-on-focus />
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
    <b-field class="evalute-result-filter__slider__wrapper">
      <span> Min Intent Confidence:<br> {{ range[0] }}% </span>
      <b-slider
        v-model="range"
        :min="0"
        :max="100"
        :step="1"
        class="evalute-result-filter__slider"
        lazy />
      <span> Max Intent Confidence: <br> {{ range[1] }}% </span>
    </b-field>
  </div>
</template>

<script>
import { formatters } from '@/utils';
import { mapGetters } from 'vuex';

export default {
  name: 'EvaluateResultExampleFilter',
  data() {
    return {
      range: [0, 100],
      search: null,
      result: null,
      intent: '',
      options: [
        { label: 'All sentences', value: null },
        { label: 'Only right', value: 'right' },
        { label: 'Only wrong', value: 'wrong' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      repository: 'getCurrentRepository',
    }),
    intents() {
      return this.repository.intents_list || [];
    },
    query() {
      const [min, max] = this.range;
      return {
        ...(this.search && this.search.length > 0
          ? {
            search: this.search,
          } : {}),
        ...(this.intent && this.intent.length > 0
          ? {
            intent: this.intent,
          } : {}),
        ...(this.result
          ? {
            result: this.result,
          } : {}),
        min,
        max,
      };
    },
  },
  watch: {
    query() {
      this.$emit('input', this.query);
    },
    async intent() {
      await this.$nextTick();
      this.intent = formatters.bothubItemKey()(this.intent);
    },
  },
};
</script>

<style lang="scss" scoped>
.evalute-result-filter {
    &__slider {
        margin: 0.5rem 1rem;
        &__wrapper {
            text-align: center;
            font-size: 0.8rem;
        }
    }
}
</style>
