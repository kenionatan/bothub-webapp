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
          <b-field grouped>
            <b-select placeholder="Enter your intention here" expanded>
              <option
                v-for="intent in repository.intents_list"
                :key="intent"
                :value="intent">Flint</option>
          </b-select>
        <p class="control">
                <b-button class="button is-primary"> Word Distribution </b-button>
            </p>
          </b-field>
        </div>
      </div>
      <div class="columns">
        <div class="dashboard__container column is-half">
          <p class="dashboard__label"> Translation Status</p>
          <div
            v-for="(item, index) in translationStatus"
            :key="item.language" >
            <div class="columns is-centered dashboard__language-status">
              <div class="column has-text-centered is-two-fifths">
                {{ item.name }}
              </div>
              <div class="column has-text-centered is-half"><b-progress
                :value="item.percentage * 100"
                size="is-small"
                type="is-primary"/></div>
              <div class="column has-text-centered">
                <span> {{ item.percentage * 100 }}% </span>
              </div>
            </div>
            <div
              v-if="index !== translationStatus.length-1"
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
import RepositoryBase from './Base';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';

export default {
  name: 'RepositoryDashboard',
  components: {
    RepositoryViewBase,
  },
  extends: RepositoryBase,
  data() {
    return {
      translationStatus: [
        {
          language: 'pt-br',
          name: 'Portuguese',
          percentage: 0.5,
        },
        {
          language: 'en',
          name: 'English',
          percentage: 0.8,
        },
        {
          language: 'esp',
          name: 'Spanish',
          percentage: 1,
        },
        {
          language: 'jp',
          name: 'Japanese',
          percentage: 0.2,
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>

    .column {
        padding: 0;
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
            border-radius: 5px;
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
    }
</style>
