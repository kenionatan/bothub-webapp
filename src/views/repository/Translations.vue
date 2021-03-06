<template>
  <repository-view-base
    :repository="repository"
    :error-code="errorCode">
    <div v-if="!authenticated">
      <b-notification
        :closable="false"
        type="is-info">
        {{ $t('webapp.trainings.login') }}
      </b-notification>
      <login-form hide-forgot-password />
    </div>
    <authorization-request-notification
      v-else-if="repository && !repository.authorization.can_contribute"
      :available="!repository.available_request_authorization"
      :repository-uuid="repository.uuid"
      @onAuthorizationRequested="updateRepository(false)" />
    <div v-else-if="repository">
      <div class="columns">
        <div class="column is-3">
          <translation-status-search
            v-model="statusQuery" />
        </div>
        <div class="column">
          <translation-status-info
            :completed-languages="completedLanguages"
            :languages="availableLanguages"
            :repository-uuid="repository.uuid" />
        </div>
      </div>
      <translations-status
        ref="translationsStatus"
        :update="updateStatus"
        :query="statusQuery"
        :repository-uuid="repository.uuid"
        v-model="toLanguage"
        class="translations__status"
        @updated="statusUpdated"/>
      <hr v-show="!(availableLanguages && availableLanguages.length <= 1)">
      <div class="translations__list">
        <translations-list
          ref="translationsList"
          :repository="repository"
          :to-language="toLanguage"
          @exampleUpdated="exampleUpdated()" />
      </div>
    </div>
  </repository-view-base>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AuthorizationRequestNotification from '@/components/repository/AuthorizationRequestNotification';
import RepositoryViewBase from '@/components/repository/RepositoryViewBase';
import TranslationsStatus from '@/components/translate/NewTranslationsStatus';
import TranslationStatusInfo from '@/components/translate/TranslationStatusInfo';
import TranslationStatusSearch from '@/components/translate/TranslationStatusSearch';
import TranslationsList from '@/components/translate/TranslationsList';
import LoginForm from '@/components/auth/LoginForm';
import RepositoryBase from './Base';


export default {
  name: 'RepositoryTranslations',
  components: {
    RepositoryViewBase,
    TranslationsStatus,
    TranslationsList,
    TranslationStatusInfo,
    AuthorizationRequestNotification,
    TranslationStatusSearch,
    LoginForm,
  },
  extends: RepositoryBase,
  data() {
    return {
      toLanguage: null,
      statusQuery: null,
      updateStatus: false,
      availableLanguages: null,
      completedLanguages: null,
      translate: {
        from: null,
        to: null,
      },
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
    ]),
  },
  methods: {
    ...mapActions([
      'getRepository',
    ]),
    statusUpdated({ completed, available }) {
      this.completedLanguages = completed;
      this.availableLanguages = available;
    },
    exampleUpdated() {
      this.updateStatus = !this.updateStatus;
    },
  },
};
</script>

<style lang="scss" scoped>

  .translations {

    &__status {
      margin-top: 3.75rem;
    }

    &__header {
      display: flex;
    }
  }
</style>
