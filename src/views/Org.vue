<template>
  <layout :show-footer="false">
    <h1
      v-if="errorMessage"
      class="has-text-centered"> {{ errorMessage }} </h1>
    <div v-else>
      <div
        class="org__header">
        <div class="org__header__content">
          <div class="org__header__info">
            <h1 class="org__header__title"> {{ org ? org.name : '' }}
              <b-icon
                v-if="org && org.verificated"
                type="is-success"
                icon="check-decagram"/>
            </h1>
            <p
              v-if="paymentEnabled"
              class="org__header__subtitle">
              {{ $t('webapp.orgs.created_by') }} <a> User </a>
            </p>
          </div>
        </div>
      </div>
      <div class="org__tabs__container">
        <tab-select
          :options="tabs"
          :selected.sync="selected"
          class="org__tabs" />
      </div>
      <b-loading :active="loading" />
      <div
        v-if="!loading"
        class="org__content">
        <div
          v-show="selected==0">
          <h1 class="org__title"> {{ $t('webapp.orgs.org_info' ) }} </h1>
          <div v-if="isMember">
            <div class="org__edit__content">
              <edit-org-form
                :nickname="nickname"
                :initial-data="org"
                class="org__edit"
                @edited="loadOrg" />

              <div class="org__repositories__separator" />
            </div>

            <h1 class="org__title"> {{ $t('webapp.orgs.manage_contributors') }} </h1>
            <div class="org__edit__content">
              <p> {{ $t('webapp.orgs.manage_subtitle' ) }} </p>
              <org-set-authorization-role-form
                ref="setAuthorizationRoleForm"
                :org-nickname="nickname"
                class="org__permissions"
                @roleSetted="onRoleSetted()" />
              <org-authorizations-list
                ref="authorizationsList"
                :org-nickname="nickname" />
            </div>
          </div>
          <div
            v-else-if="org"
            class="org__edit__content">
            <br>
            <p
              v-if="org.locale && org.locale.length > 0"
              v-html="$t('webapp.orgs.from', {locale: org.locale})"/>
            <br>
            <br>
            {{ org.description }}
            <br>
          </div>

        </div>
        <div v-show="selected==1">
          <div
            v-show="noRepositories"
            class="org__add-repo org__edit__content">
            <p> {{ $t('webapp.orgs.no_repo') }} </p>
            <router-link to="/new">
              <b-button
                v-if="isMember"
                type="is-primary"> {{ $t('webapp.orgs.add_repo') }} </b-button>
            </router-link>
          </div>
          <h1 class="org__title"> {{ $t('webapp.orgs.intelligences.mine') }} </h1>
          <div
            :class="{
              'org__search-repository': true,
              'org__search-repository__empty': repositoryLists.org.empty}">
            <b-field class="org__search-repository__input">
              <b-input
                v-model="search"
                :placeholder="$t('webapp.layout.search_bots')"
                no-border
                icon-right="magnify"
              />
            </b-field>
            <div class="org__search-repository__categories">
              <categories-list
                v-model="category"/>
              <languages-list
                v-model="language"
                open-position="bottom-left" />
            </div>
          </div>
          <div v-show="!repositoryLists.org.empty">

            <paginated-list
              v-if="repositoryLists.org"
              :item-component="repositoryItemElem"
              :per-page="repositoriesLimit"
              :list="repositoryLists.org"
              :empty-message="$t('webapp.home.no_repo')"
              class="org__repositories__cards" />

            <div
              v-if="!repositoryLists.using.empty"
              class="org__repositories__separator" />
          </div>
          <p
            v-if="repositoryLists.org.empty && checkInputs"
            class="org__search-repository__empty__text">
            {{ $t('webapp.my_profile.no_repo_filter') }}
          </p>

          <div v-show="!repositoryLists.using.empty">
            <h1 class="org__title"> {{ $t('webapp.orgs.intelligences.using') }} </h1>
            <paginated-list
              v-if="repositoryLists.using"
              :item-component="repositoryItemElem"
              :per-page="repositoriesLimit"
              :list="repositoryLists.using"
              :empty-message="$t('webapp.home.no_repo')"
              class="org__repositories__cards" />
          </div>
        </div>
        <div
          v-show="selected==2">
          <h1 class="org__title"> {{ $t('webapp.orgs.activities.recent' ) }} </h1>
          <div class="org__edit__content">
            <activities class="org__activities" />
          </div>
        </div>
        <div
          v-show="selected==3">
          <div class="org__edit__content">
            <user-report-list :org-nickname="nickname"/>
          </div>
        </div>
        <div
          v-if="selected==4">
          <h1 class="org__title"> {{ $t('webapp.orgs.payment.history') }} </h1>
          <div class="org__edit__content org__payment__content">
            <payment-history />
          </div>
          <div class="org__repositories__separator" />
          <h1 class="org__title"> {{ $t('webapp.orgs.payment.info') }} </h1>
          <div class="org__edit__content org__payment__content">
            <payment-form class="org__payment__form" />
          </div>
          <h1 class="org__title"> {{ $t('webapp.orgs.payment.coupon_payment') }} </h1>
          <div class="org__edit__content org__payment__content">
            <b-field>
              <b-input
                v-model="coupon"
                expanded/>
              <b-button
                class="org__payment__button"
                type="is-primary"
                @click="submitCoupon"> {{ $t('webapp.orgs.payment.submit') }} </b-button>
            </b-field>
          </div>
        </div>
      </div>
    </div>
  </layout>
</template>

<script>
import _ from 'lodash';
import Layout from '@/components/shared/Layout';
import UserAvatar from '@/components/user/UserAvatar';
import EditOrgForm from '@/components/org/EditOrgForm';
import RepositoryCard from '@/components/repository/RepositoryCard';
import Activities from '@/components/user/Activities';
import UserReportList from '@/components/user/UserReportList';
import TabSelect from '@/components/shared/TabSelect';
import PaginatedList from '@/components/shared/PaginatedList';
import PaymentForm from '@/components/payment/PaymentForm';
import PaymentHistory from '@/components/payment/PaymentHistory';
import OrgSetAuthorizationRoleForm from '@/components/org/OrgSetAuthorizationRoleForm';
import OrgAuthorizationsList from '@/components/org/OrgAuthorizationsList';
import CategoriesList from '@/components/shared/CategoriesList';
import LanguagesList from '@/components/shared/LanguagesList';

import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'Org',
  components: {
    Layout,
    UserAvatar,
    EditOrgForm,
    TabSelect,
    PaginatedList,
    Activities,
    UserReportList,
    CategoriesList,
    LanguagesList,
    PaymentForm,
    PaymentHistory,
    OrgSetAuthorizationRoleForm,
    OrgAuthorizationsList,
  },
  data() {
    return {
      org: null,
      errorMessage: null,
      loading: false,
      selected: 0,
      category: 0,
      language: '',
      search: '',
      repositoryItemElem: RepositoryCard,
      paymentEnabled: process.env.BOTHUB_WEBAPP_PAYMENT_ENABLED,
      repositoryLists: {
        org: { empty: false },
        using: { empty: !process.env.BOTHUB_WEBAPP_PAYMENT_ENABLED },
      },
      repositoriesLimit: 6,
      tabs: [
        { label: this.$t('webapp.orgs.information'), value: 0 },
        { label: this.$t('webapp.orgs.intelligences.title'), value: 1 },
        { label: this.$t('webapp.orgs.activities.title'), value: 2, hide: !process.env.BOTHUB_WEBAPP_PAYMENT_ENABLED },
        { label: this.$t('webapp.orgs.reports.title'), value: 3 },
        { label: this.$t('webapp.orgs.payment.title'), value: 4, hide: !process.env.BOTHUB_WEBAPP_PAYMENT_ENABLED },
      ],
      coupon: null,
    };
  },
  computed: {
    ...mapGetters([
      'authenticated',
    ]),
    nickname() {
      return this.$route.params.org_nickname;
    },
    noRepositories() {
      return Object.values(this.repositoryLists).every(value => value.empty);
    },
    isMember() {
      if (!this.org || !this.org.authorization) return false;
      return this.org.authorization.can_write;
    },
    checkInputs() {
      if (this.language !== ''
      || this.search !== ''
      || this.category !== 0) return true;

      return false;
    },
  },
  watch: {
    authenticated() {
      if (!this.authenticated) {
        this.$router.push({
          name: 'signIn',
        });
      }
    },
    category() {
      this.updateRepositoryList();
    },
    language() {
      this.updateRepositoryList();
    },
    search() {
      this.updateRepositoryList();
    },
  },
  mounted() {
    this.loadOrg();
    this.updateRepositories();
  },
  methods: {
    ...mapActions([
      'getOrgUsingRepositories',
      'getOrgRepositories',
      'getOrg',
    ]),
    updateRepositoryList: _.debounce(async function debounceSearch() {
      const { search } = this;
      let repositorySearch;
      if (this.category === 0) {
        repositorySearch = await this.getOrgRepositories({
          nickname: this.nickname,
          language: this.language,
          search,
          limit: this.repositoriesLimit,
        });
      } else if (this.category > 0) {
        repositorySearch = await this.getOrgRepositories({
          nickname: this.nickname,
          categories: this.category,
          language: this.language,
          search,
          limit: this.repositoriesLimit,
        });
      }
      this.repositoryLists.org = repositorySearch;
    }, 1000),
    async loadOrg() {
      this.loading = true;
      try {
        const response = await this.getOrg({ nickname: this.nickname });
        this.org = response.data;
        this.errorMessage = null;
      } catch (e) {
        this.errorMessage = e.response.data.detail || this.$t('webapp.orgs.default_error');
      } finally {
        this.loading = false;
      }
    },
    submitCoupon() {},
    async updateRepositories() {
      this.repositoryLists.org = await this.getOrgRepositories(
        { nickname: this.nickname, limit: this.repositoriesLimit },
      );
      if (this.paymentEnabled) {
        this.repositoryLists.using = await this.getOrgUsingRepositories(
          { nickname: this.nickname, limit: this.repositoriesLimit },
        );
      }
    },
    onRoleSetted() {
      this.$refs.authorizationsList.updateAuthorizations();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/utilities.scss';
@import '~@/assets/scss/variables.scss';

h1 {
        max-width: 58.25rem;
        padding: 0 1rem;
        margin: 0.75rem auto;
        display: block;
      }

    .org {

        &__title {
            max-width: 56.25rem;
            font-size: 1.75rem;
            font-weight: bold;
            padding: 0 1rem;
            margin: 0 auto;
        }

        &__content {
          padding: 3.875rem 0 6.563rem 0;
        }

        &__header {
            background-color: $color-white;
            text-align: center;
            width: 100%;
            padding: 4rem 0;
            &__content {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                margin: 1rem;
                align-items: center;
            }
            &__title {
              font-size: 1.5rem;
              font-weight: bold;
              margin: 0 0 0.625rem 0;
            }
            &__subtitle {
              font-size: 0.875rem;
              margin: 0 1rem 0.625rem 1rem;
              color: $color-grey-darker;
            }
        }
        &__search-repository{
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          max-width: 72.875rem;
          padding: 1rem;
          margin: auto;

          &__input{
            padding-left: 1rem;
            margin: 0;
          }

          &__empty{
            margin-bottom: 5rem;

            &__text{
              font-weight: $font-weight-bolder;
              text-align: center;
              margin-bottom: 3rem;
            }
          }

          &__categories{
          display: flex;
          justify-content: flex-end;

          > * {
            margin-left: 0.625rem;
          }

          @media screen and (max-width: $mobile-width) {
           flex-direction: column;
          }

        }
         @media screen and (max-width: $mobile-width) {
           align-items: center;
          }
      }

        &__tabs {
          &__container {
            background-color: $color-white;
            width: 100%;
          }
        }

        &__add-repo {
          display: flex;
          justify-content: flex-end;
          > * {
            margin-right: 1rem;
          }
        }

        &__repositories {

          &__separator {
            background-color: $color-grey;
            max-width: 50rem;
            height: 2px;
            margin: 1rem auto 5rem auto;
          }

          &__cards {
            display: flex;
            flex-wrap: wrap;
            max-width: 72.875rem;
            padding: 1rem;
            margin: auto;
          }
        }
        &__edit {
          max-width: 40rem;
          margin-top: 1.563rem;
          padding: 0 0 4rem 0;
          &__content {
            max-width: 56.25rem;
            padding: 0 1rem;
            margin: 0 auto;
          }
        }

        &__activities {
          margin-top: 2.5rem;
        }

        &__permissions {
          margin-top: 2.813rem;
        }

        &__payment {

          &__content {
            margin-top: 2.313rem;
          }

          &__button {
            margin-left: 0.625rem;
          }

          &__form {
            max-width: 30rem;
            margin-bottom: 2rem
          }
        }
    }
</style>
