<template>
  <div>
    <loading
      v-if="loading" />
    <p
      v-else-if="filteredLanguagesStatus.length === 0 && computedLanguagesStatus.length !== 0"
      class="has-text-centered"> {{ $t('webapp.translate.no_translated') }} </p>
    <transition-group
      name="list"
      mode="out-in"
      tag="div">
      <div
        v-for="{ status, language, verbose, selected } in filteredLanguagesStatus"
        :key="language"
        :ref="`status-${language}`"
        class="card list-item"
        @click="select(language)">
        <div class="columns is-vcentered">
          <p class="card-language has-text-centered column is-2">
            <span>{{ verbose }}</span>
          </p>
          <div
            :class="{ selected }"
            class="column is-9">
            <div class="card-percentage__wrapper">
              <div
                :style="percentageStyle(status.base_translations.percentage)"
                class="card-percentage" />
            </div>
          </div>
          <strong class="column has-text-centered is-1">
            {{ Number(status.base_translations.percentage.toFixed(2)) }}%
          </strong>
        </div>
      </div>
    </transition-group>
    <p
      v-show="!loading && filteredLanguagesStatus.length > 0"
      class="card-count">
      {{ $t('webapp.translate.showing',
            { available: languageCount, count: filteredLanguagesStatus.length }) }}
    </p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { formatters, languageListToDict } from '@/utils';
import Loading from '@/components/shared/Loading';

const components = {
  Loading,
};

export default {
  name: 'TranslationsStatus',
  components,
  props: {
    repositoryUuid: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      default: null,
    },
    update: {
      type: Boolean,
      default: false,
    },
    query: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      languagesStatus: null,
      selected: this.value,
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      version: 'getSelectedVersion',
    }),
    languages() {
      if (!this.languagesStatus) return {};
      return languageListToDict(Object.keys(this.languagesStatus));
    },
    languageCount() {
      if (!this.languagesStatus) return 0;
      return Object.keys(this.languagesStatus).length;
    },
    computedLanguagesStatus() {
      if (!this.languagesStatus) {
        return [];
      }
      return Object.keys(this.languagesStatus)
        .map(language => ({
          language,
          status: this.languagesStatus[language],
          verbose: this.languages[language],
          selected: this.selected === language,
        }))
        .filter(languageStatus => (languageStatus.status.is_base_language
        || languageStatus.status.base_translations.percentage > 0));
    },
    filteredLanguagesStatus() {
      return this.computedLanguagesStatus.filter((language) => {
        if (language.status.is_base_language) return false;

        if (!this.query) return true;

        if (this.query.search && this.query.search.length > 0) {
          const search = new RegExp(formatters.bothubItemKey()(this.query.search));
          if (!search.test(formatters.bothubItemKey()(language.verbose))) return false;
        }

        if (this.query['max-percentage']
          && language.status.base_translations.percentage > this.query['max-percentage']) return false;
        if (this.query['min-percentage']
          && language.status.base_translations.percentage < this.query['min-percentage']) return false;
        return true;
      })
        .sort((a, b) => (
          a.status.base_translations.percentage
          < b.status.base_translations.percentage ? 1 : -1));
    },
  },
  watch: {
    async ownerNickname() { await this.updateTranslationsStatus(); },
    async repositorySlug() { await this.updateTranslationsStatus(); },
    computedLanguagesStatus() {
      const completed = this.computedLanguagesStatus
        .filter(status => !status.status.is_base_language
          && status.status.base_translations.percentage >= 100)
        .map(status => status.verbose);
      this.$emit('updated', {
        completed,
        available: this.computedLanguagesStatus.map(language => language.verbose),
      });
      return completed;
    },
    selected() {
      this.$emit('input', this.selected);
    },
    update() {
      this.updateTranslationsStatus();
    },
  },
  async mounted() {
    await this.updateTranslationsStatus();
  },
  methods: {
    ...mapActions([
      'getRepositoryLanguagesStatus',
    ]),
    percentageStyle(percentage) {
      return {
        width: `${Math.min(percentage, 100)}%`,
      };
    },
    async updateTranslationsStatus() {
      this.loading = true;
      this.languagesStatus = null;
      try {
        const response = await this.getRepositoryLanguagesStatus({
          repositoryUUID: this.repositoryUuid,
          version: this.version,
        });
        this.languagesStatus = response.data.languages_status;
      } catch (e) {
        this.languagesStatus = null;
      } finally {
        this.loading = false;
      }
    },
    select(language) {
      this.selected = language;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/colors.scss';

.list-enter-active, .list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to {
  opacity: 0.4;
  float: bottom;
  transform: translateY(-5%);
}

.list-item:not(:last-child) {
    margin-bottom: 1rem;
}

.card {
  background-color: $color-white;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  border: 1px solid $color-border;
  cursor: pointer;
  transition:
    box-shadow .2s ease,
    background-color .2s ease;
  border-radius: 4px;

  &:hover,
  &.selected {
    background-color: white;
    box-shadow: 0 0 8px rgba(100, 100, 100, .3);
  }

  &-percentage {
    background-color: $color-primary;
    height: 100%;
    &__wrapper {
      background-color: $color-grey-light;
      width: 100%;
      height: 1.563rem;
    }
  }

  &-count {
    text-align: right;
    color: $color-grey-dark;
  }

  &-language {
    display: flex;
    align-items: center;
    margin: 8px 0;
    justify-content: center;

    > * {
      margin-right: 8px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
