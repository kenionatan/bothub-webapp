<template>
  <div class="intelligence-force">
    <h2>
      <strong>
        {{ $t('webapp.summary.intelligence_force') }}:
      </strong>
      {{ relevanceProgress }}
    </h2>
    <div
      class="intelligence-force__relevance__progress">
      <div
        :style="{ width: intelligenceForce + '%' }"
        class="intelligence-force__relevance__bar-field">
        <div class="intelligence-force__relevance__division">
          <div
            v-for="index in 5"
            :key="index"
            class="intelligence-force__relevance__division__stripe"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'IntelligenceForce',
  computed: {
    ...mapGetters([
      'getCurrentRepository',
    ]),
    intelligenceForce() {
      const scoreObject = this.getCurrentRepository.repository_score;
      const scoreResult = (scoreObject.evaluate_size_score
      + scoreObject.intents_balance_score + scoreObject.intents_size_score) / 3;
      return scoreResult;
    },
    relevanceProgress() {
      if (this.intelligenceForce <= 33) {
        return this.$t('webapp.summary.intelligence_force_low');
      }
      if (this.intelligenceForce >= 34 && this.intelligenceForce <= 63) {
        return this.$t('webapp.summary.intelligence_force_regular');
      }
      if (this.intelligenceForce >= 64 && this.intelligenceForce <= 100) {
        return this.$t('webapp.summary.intelligence_force_high');
      }

      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/colors.scss';
@import '~@/assets/scss/variables.scss';

.intelligence-force{
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding-left: 3rem;
        margin-top: .8rem;
        margin-left: 0.5rem;
        border: 1px solid $color-border;
        height: 147px;

    &__relevance {
      display: flex;
      margin-bottom: 4rem;

      &__progress {
        height: 20px;
        width: 80%;
        background-color: #EAEAEA;
        box-shadow: 0px 3px 6px #00000029;
      }
      &__bar-field {
        background: linear-gradient(to right, #12A391 0%, #00FFDD 100%);
        height: 20px;
        width: 15px;

        &__icon{
          float: right;
        }
      }
      &__division{
        display:flex;
        width: 62%;
        position:absolute;

        &__stripe{
          border: 2px solid white;
          height: 20px;
          margin-left: 16%;
        }
      }
    }
    @media screen and (max-width: 45em) {
        h2{
            font-size: 1.4rem;
        }
    }
}

</style>
