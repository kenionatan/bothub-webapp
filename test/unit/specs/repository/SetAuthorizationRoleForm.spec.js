/* eslint-disable import/first */
jest.mock('@/api/request');

import Vuex from 'vuex';
import Buefy from 'buefy';
import { shallow, createLocalVue } from '@vue/test-utils';

import store from '@/store';
import TYPES from '@/store/types';
import { ROLE_CONTRIBUTOR } from '@/utils';
import SetAuthorizationRoleForm from '@/components/repository/SetAuthorizationRoleForm';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Buefy);

describe('SetAuthorizationRoleForm.vue', () => {
  let wrapper;
  beforeEach(async () => {
    store.replaceState({
      Auth: {},
    });
    store.commit(TYPES.SET_TOKEN, '1f5e7e21d331536b58448595f69eb50a6b5e49b8');
    wrapper = shallow(SetAuthorizationRoleForm, {
      localVue,
      store,
      propsData: {
        repositoryUuid: '8511fd26-a3bc-4f74-9af1-176abca5401d',
      },
    });
    await localVue.nextTick();
  });

  test('mount', () => {
    expect(wrapper.vm).toBeDefined();
  });

  describe('fill', () => {
    beforeEach(() => {
      wrapper.vm.userProfile = {
        nickname: 'douglas',
      };
      wrapper.vm.role = ROLE_CONTRIBUTOR;
    });

    test('check userProfile nickname', () => {
      expect(wrapper.vm.userProfile.nickname).toBe('douglas');
    });

    test('check role', () => {
      expect(wrapper.vm.role).toBe(ROLE_CONTRIBUTOR);
    });

    describe('submit', () => {
      beforeEach(() => {
        wrapper.vm.onSubmit();
      });

      test('emit roleSetted', () => {
        expect(wrapper.emitted('roleSetted')).toBeDefined();
      });
    });
  });

  describe('fill with owner', () => {
    beforeEach(() => {
      wrapper.vm.userProfile = {
        nickname: 'fake',
      };
      wrapper.vm.role = ROLE_CONTRIBUTOR;
    });

    test('check userProfile nickname', () => {
      expect(wrapper.vm.userProfile.nickname).toBe('fake');
    });

    describe('submit', () => {
      beforeEach(() => {
        wrapper.vm.onSubmit();
      });

      test('not emit roleSetted', () => {
        expect(wrapper.emitted('roleSetted')).not.toBeDefined();
      });
    });
  });
});
