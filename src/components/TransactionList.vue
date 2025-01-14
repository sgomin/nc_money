<template>
  <div
    class="
      flex
      w-full
      flex-col
      overflow-scroll
    "
  >
    <DynamicScroller
      :items="items"
      :min-item-size="45"
      :emit-update="true"
      @update="onDynamicScrollerUpdate"
    >
      <template #before>
        <NewTransactionInput
          class="mx-2"
          :account-id="account.id"
          :inverted-value="isInvertedAccount"
        />
      </template>

      <template #default="{ item, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          class="p-2"
        >
          <div
            v-if="item.type === 'headOfGroup'"
            class="
              mt-8
              mb-5
              border-b
              border-solid border-border-dark pb-3
              text-center text-xl text-border-dark
            "
          >
            {{ dayjs(item.transaction.date).format(groupByDateFormat) }}
          </div>

          <TransactionListItem
            :transaction="item.transaction"
            :account-id="account.id"
            :inverted-value="isInvertedAccount"
          />
        </DynamicScrollerItem>
      </template>

      <template #after>
        <div
          v-if="transactionStore.allTransactionsFetched"
          class="
            mt-3 mb-10
            border-t border-solid border-border-dark
            pt-5
            text-center text-xl text-border-dark
          "
        >
          {{ t('money', 'End of transactions') }}
        </div>
      </template>
    </DynamicScroller>
  </div>
</template>

<script lang="ts">
  import dayjs from 'dayjs';

  import { defineComponent, type PropType } from 'vue';

  import { AccountTypeUtils } from '../utils/accountTypeUtils';

  import type { Account } from '../stores/accountStore';
  import {
    type Transaction,
    useTransactionStore
  } from '../stores/transactionStore';
  import { useSplitStore } from '../stores/splitStore';
  import { useTransactionService } from '../services/transactionService';

  import { useSettingStore } from '../stores/settingStore';

  import TransactionListItem from './TransactionListItem.vue';
  import NewTransactionInput from './NewTransactionInput.vue';

  import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';

  export default defineComponent({
    props: {
      account: {
        type: Object as PropType<Account>,
        required: true
      }
    },
    data(): {
      transactions: Array<Transaction>;
      transactionWatcher: {stop: () => void} | null;
      accountIsChanging: boolean;
      isLoadingTransactions: boolean;
      groupBy: 'month';
      items: Array<{
        transaction: Transaction;
        type: 'normal'|'headOfGroup'
      }>;
    } {
      return {
        transactions: [],
        transactionWatcher: null,
        accountIsChanging: false,
        isLoadingTransactions: false,
        groupBy: 'month',
        items: []
      };
    },
    computed: {
      groupByDateFormat() {
        return 'MM.YYYY';
      },
      isInvertedAccount() {
        return this.settingStore.useInvertedAccounts && AccountTypeUtils.isInvertedAccount(this.account.type);
      }
    },
    watch: {
      async account() {
        await this.changeAccount();
      },
      transactions() {
        this.items = this.transactions.map((t, index) => ({
          id: t.id,
          transaction: t,
          type: this.transactionIsHeadOfGroup(t, index) ? 'headOfGroup' : 'normal'
        }));
      }
    },
    methods: {
      async changeAccount() {
        this.accountIsChanging = true;

        await this.transactionService.changeAccount(this.account.id);
        this.transactions = await this.transactionStore.getByAccountId(this.account.id);

        if (this.transactionWatcher) {
          this.transactionWatcher.stop();
        }
        this.transactionWatcher = await this.transactionStore.watchAll((transactions) => {
          this.transactions = transactions;
        })

        this.accountIsChanging = false;
      },
      async loadMoreTransactions() {
        if (
          this.accountIsChanging ||
          this.isLoadingTransactions ||
          this.transactionStore.allTransactionsFetched
        ) return;

        this.isLoadingTransactions = true;

        const offset = this.transactions.length;
        await this.transactionService.fetchAndInsertTransactions(offset);

        this.isLoadingTransactions = false;
      },
      async onDynamicScrollerUpdate(_startIndex: number, endIndex: number) {
        if(endIndex + 10 >= this.transactions.length) {
          await this.loadMoreTransactions();
        }
      },
      transactionIsHeadOfGroup(transaction: Transaction, index: number) {
        return this.groupBy &&
          (
            !this.transactions[index - 1] ||
            dayjs(transaction.date)
              .isBefore(this.transactions[index - 1]?.date, this.groupBy)
          );
      }
    },
    setup() {
      return {
        transactionStore: useTransactionStore(),
        transactionService: useTransactionService(),
        splitStore: useSplitStore(),
        settingStore: useSettingStore(),
        dayjs,
        AccountTypeUtils
      };
    },
    async mounted() {
      await this.changeAccount();
    },
    destroyed() {
      this.transactionWatcher?.stop();
    },
    components: {
      TransactionListItem,
      NewTransactionInput,
      DynamicScroller,
      DynamicScrollerItem
    }
  });
</script>
