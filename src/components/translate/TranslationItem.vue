<template>
  <div class="translation">
    <div class="translation-text">
      <div class="columns is-mobile">
        <div class="column">
          <highlighted-text
            :text="currentText"
            :entities="currentEntities"
            :highlighted="highlighted"
            size="large" />
        </div>
        <div class="column is-narrow">
          <button
            ref="showOriginal"
            :disabled="loadingOriginal"
            :class="{
              button: true,
              'is-small': true,
              'is-primary': !showingOriginal,
              'is-info': showingOriginal,
              'is-loading': loadingOriginal,
            }"
            @click="toggleOriginal()">
            <span v-if="showingOriginal">
              {{ $t('webapp.translate.show_translated') }}
            </span>
            <span v-else>{{ $t('webapp.translate.show_original') }}</span>
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="entitiesList.length > 0"
      class="translation-entities">
      <entity-tag
        v-for="(entity, i) in entitiesList"
        :key="i"
        :entity-name="entity"
        :highlighted="highlighted === entity"
        @mouseenter.native.stop="highlighted = entity"
        @mouseleave.native.stop="highlighted = null"
      />
    </div>
    <div class="translation-infos level is-mobile">
      <div class="level-left">
        <div class="level-item">
          <strong>{{ $t('webapp.translate.translated_from') }}&nbsp;</strong>
          <span>{{ from_language | languageVerbose }}&nbsp;</span>
          <flag :language="from_language" />
          <strong>&nbsp;</strong>
          <strong>{{ $t('webapp.translate.to') }}&nbsp;</strong>
          <span>{{ language | languageVerbose }}&nbsp;</span>
          <flag :language="language" />
        </div>
        <div class="level-item has-text-grey-light">
          {{ created_at | moment('from') }}
        </div>
      </div>
      <div
        v-if="repository.authorization && repository.authorization.can_contribute"
        class="level-right">
        <div class="level-item">
          <a
            :href="`#delete-translation-${id}`"
            class="has-text-danger"
            @click.prevent="deleteThisTranslation()">
            <b-icon icon="delete" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getEntitiesList } from '@/utils';
import { getEntityColor } from '@/utils/entitiesColors';
import HighlightedText from '@/components/shared/HighlightedText';
import EntityTag from '@/components/repository/repository-evaluate/example/EntityTag';
import Flag from '@/components/shared/Flag';
import { mapActions } from 'vuex';

export default {
  name: 'TranslationItem',
  components: {
    HighlightedText,
    EntityTag,
    Flag,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      default: '...',
    },
    entities: {
      type: Array,
      default: /* istanbul ignore next */ () => ([]),
    },
    from_language: {
      type: String,
      default: '...',
    },
    language: {
      type: String,
      default: '...',
    },
    original_example: {
      type: Number,
      required: true,
    },
    created_at: {
      type: String,
      default: '',
    },
    repository: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      loadingOriginal: false,
      original: null,
      showingOriginal: false,
      deleteDialog: null,
      highlighted: null,
    };
  },
  computed: {
    currentText() {
      return this.showingOriginal
        ? this.original.text
        : this.text;
    },
    currentEntities() {
      return this.showingOriginal
        ? this.original.entities
        : this.entities;
    },
    entitiesList() {
      return getEntitiesList(this.currentEntities);
    },
  },
  methods: {
    ...mapActions([
      'getExample',
      'deleteTranslation',
    ]),
    getEntityClass(entity) {
      const color = getEntityColor(
        entity,
        this.repository.entities || this.repository.entities_list,
        this.currentEntities,
      );
      return `entity-${color}`;
    },
    deleteThisTranslation() {
      this.deleteDialog = this.$buefy.dialog.confirm({
        message: this.$t('webapp.translate.translation_delete_confirm', { language: this.language }),
        confirmText: this.$t('webapp.home.delete'),
        cancelText: this.$t('webapp.home.cancel'),
        type: 'is-danger',
        onConfirm: async () => {
          await this.deleteTranslation({ translationId: this.id });
          this.$emit('deleted');
        },
      });
    },
    async toggleOriginal() {
      if (!this.original) {
        this.loadingOriginal = true;
        const response = await this.getExample({
          id: this.original_example,
        });
        this.original = response.data;
        this.loadingOriginal = false;
      }
      this.showingOriginal = !this.showingOriginal;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/utilities.scss';

.translation {
  $radius: 8px;

  margin: 16px 8px;
  background-color: $white-bis;
  border-radius: $radius;
  overflow: visible;

  &:hover {
    .translation-text {
      background-color: $white;
      box-shadow: 0 2px 8px rgba(100, 100, 100, .5);
    }
  }

  &-text {
    font-size: 1.25rem;
    background-color: $white-ter;
    border-radius: $radius;
    transition: box-shadow .2s ease;
    padding: 8px 16px;
    margin-bottom: 4px;
  }

  &-entities,
  &-infos {
    padding: 4px 8px 4px 16px;
  }

  &-entities {
    > * {
      margin: 0 8px 0 0;

      &:last-child {
        margin: 0;
      }
    }
  }
}
</style>
