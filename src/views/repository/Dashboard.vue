<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">

    <div
      v-if="repository"
      class="dashboard">
      <div class="columns">
        <div class="dashboard__container column is-one-quarter">
          <p class="dashboard__label"> Intelligence Numbers </p>
          <p class="dashboard__numbers__big-text"> {{ repository.examples__count }} </p>
          <p class="dashboard__label"> Sentences</p>
          <div class="dashboard__numbers__separator" />
          <p class="dashboard__numbers__big-text"> {{ repository.intents.length }} </p>
          <p class="dashboard__label"> Intents</p>
          <div class="dashboard__numbers__separator" />
          <p class="dashboard__numbers__big-text"> {{ repository.entities ? repository.entities.length : 0 }} </p>
          <p class="dashboard__label"> Entities</p>
          <div class="dashboard__numbers__separator" />
          <p class="dashboard__numbers__big-text"> {{ repository.labels.length }} </p>
          <p class="dashboard__label"> Labels</p>

        </div>
        <div class="dashboard__container column is-three-quarters">
          <p class="dashboard__label"> Word Distribution</p>
          <div class="dashboard__words__container">
            <b-field grouped>
              <b-select
                placeholder="Enter your intention here"
                expanded>
                <option
                  v-for="intent in repository.intents_list"
                  :key="intent"
                  :value="intent">Flint</option>
              </b-select>
              <b-button class="button is-primary"> Word Distribution </b-button>
            </b-field>
            <p> Analyze the relevance of each words in your intentions </p>
            <wordcloud
              :data="defaultWords"
              :color="myColors"
              :show-tooltip="true"
              :rotate="{from: 0, to: 0, numOfOrientation: 0 }"
              name-key="name"
              value-key="value"/>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="dashboard__container column is-half">
          <p class="dashboard__label"> Translation Status</p>
          <div
            v-for="(translation, index) in translationsStatus"
            :key="translation.id" >
            <div class="columns is-centered dashboard__language-status">
              <div class="column has-text-centered is-two-fifths">
                <div class="dashboard__language__name__container">
                  <flag :language="translation.id" />
                  <span class="dashboard__language__name"> {{ translation.title }} </span>
                </div>
              </div>
              <div class="column has-text-centered is-half">
                <span class="dashboard__progress__wrapper">
                  <b-progress
                    :value="translation.percentage"
                    size="is-small"
                    type="is-primary"/>
                </span>
              </div>
              <div class="column has-text-centered">
                <span class="dashboard__language__percentage"> {{ translation.percentage }}% </span>
              </div>
            </div>
            <div
              v-if="index !== translationsStatus.length-1"
              class="dashboard__numbers__separator" />
          </div>
        </div>
        <div class="dashboard__container column is-half">
          <p class="dashboard__label"> Intelligence Evolution </p>
        </div>
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import { mapActions } from 'vuex';
import wordcloud from 'vue-wordcloud';
import RepositoryBase from './Base';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import Flag from '@/components/shared/Flag';
import TranslationsStatus from '@/components/translate/TranslationsStatus';
import { LANGUAGES } from '@/utils';

export default {
  name: 'RepositoryDashboard',
  components: {
    RepositoryViewBase,
    wordcloud,
    Flag,
    TranslationsStatus,
  },
  extends: RepositoryBase,
  data() {
    return {
      languageStatus: null,
      myColors: ['#3AD4A1', '#4AEB96', '#1AC41345', '#025624', '#3DDDC8'],
      defaultWords: [{
        name: 'Cat',
        value: 26,
      },
      {
        name: 'fish',
        value: 19,
      },
      {
        name: 'things',
        value: 18,
      },
      {
        name: 'look',
        value: 16,
      },
      {
        name: 'two',
        value: 15,
      },
      {
        name: 'fun',
        value: 9,
      },
      {
        name: 'know',
        value: 9,
      },
      {
        name: 'good',
        value: 9,
      },
      {
        name: 'play',
        value: 6,
      },
      ],
    };
  },
  computed: {
    repositoryUUID() {
      if (!this.repository || this.repository.uuid === 'null') return null;
      return this.repository.uuid;
    },
    translationsStatus() {
      if (!this.languageStatus) return null;

      return Object.entries(this.languageStatus).map(entry => ({
        id: entry[0],
        percentage: entry[1].base_translations.percentage,
        title: LANGUAGES[entry[0]],
      }));
    },
  },
  watch: {
    async repositoryUUID() {
      if (!this.repositoryUUID) return;
      const response = await this.getLanguageStatusByUUID(this.repositoryUUID);
      this.languageStatus = response.data.languages_status;
    },
  },
  methods: {
    ...mapActions([
      'getLanguageStatusByUUID',
    ]),
  },
};
</script>

<style lang="scss" scoped>

    .columns {
        margin: 0;
    }

    .dashboard {
        &__language-status {
            padding: 0.82rem;
            vertical-align: middle;
        }

        &__label {
            color: #212121;
            font-size: 1rem;
            font-weight: bold;
        }

        &__container {
            text-align: center;
            margin: 0.82rem;
            background-color: #F5F5F5;
            border-radius: 15px;
        }

        &__language {

          &__percentage {
              font-size: 0.8rem;
          }

          &__name {

            margin-left: 1rem;
            font-size: 0.8rem;
            color: #2BBFAC;

            &__container {
              display: flex;
              justify-items: flex-start;
            }
          }
        }

        &__progress__wrapper {
          display: inline-block;
        }

        &__numbers {

            &__big-text {
                color: #3AD4A1;
                font-size: 5.4rem;
                font-weight: bold;
            }
            &__separator {
                height: 1px;
                width: 100%;
                background-color: #CFD5D9;
            }
        }

        &__words {
          &__container {
            margin: 0 5.6rem 0 5.6rem;
          }
        }
    }
</style>
