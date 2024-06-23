const { createApp } = Vue;
const og_loot = Vue.createApp();

const ogLootMixins = {
    methods: {
        addPlayer: function () {
            if (this.data_form.new_player.length >= 3) {
                this.data_form.players.push({
                    name: this.data_form.new_player,
                    ress: {
                        metal: 0,
                        crystal: 0,
                        deuterium: 0
                    }
                });

                this.data_form.new_player = '';
            }
        },
        deletePlayer: function (key) {
            this.data_form.players.splice(key, 1);
        },
        nbPlayer: function (nb) {
            return nb
        },
        resetTotalLoot: function () {
            return {
                metal: 0,
                crystal: 0,
                deuterium: 0
            };
        },
        numberFormat: function (val) {
            return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    },
    computed: {
        hasPlayers: function() {
            return this.data_form.players.length;
        }
    }
};

og_loot.component('og-loot', {
    mixins: [ogLootMixins],
    data: function () {
        return {
            data_form: {
                new_player: '',
                dispatch: 1,
                players: [],
                total_loot: this.resetTotalLoot()
            }
        }
    },
    mounted: function () {
        this.setTotalLoot();
    },
    methods: {
        setTotalLoot: function () {
            this.data_form.total_loot = this.resetTotalLoot();

            this.data_form.players.forEach((player) => {
                for (let ress in player.ress) {
                    this.data_form.total_loot[ress];
                    this.data_form.total_loot[ress] += player.ress[ress];
                }
            });
        }
    },
    watch: {
        'data_form.players': {
            handler: function() {
                this.setTotalLoot();
            },
            deep: true
        }
    },
    template: `
        <form>
            <div class="d-flex justify-content-end">
                <div class="row g-2 align-items-center">
                    <div class="col-auto">
                        <div class="form-group">
                            <label for="dispatch">Diviser en </label>
                            <select
                                id="dispatch"
                                v-model="data_form.dispatch"
                                class="ms-2 form-control-sm"
                            >
                                <option
                                    v-for="val in 5" v-bind:value="val"
                                >
                                    {{nbPlayer(val)}}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="col-auto">
                        <input
                            v-model="data_form.new_player"
                            type="text"
                            placeholder="Nom du joueur"
                            class="ms-2 form-control-sm"
                        />
                    </div>

                    <div class="col-auto">
                        <button
                            v-on:click.stop.prevent="addPlayer()"
                            class="btn btn-sm btn-warning"
                        >
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-3">
                <og-loot-table-infos
                    v-bind:title="'Gain total des ressources'"
                    v-bind:table_type="'loot'"
                    v-bind:data_form="data_form"
                ></og-loot-table-infos>
            </div>

            <div v-if="data_form.players.length && data_form.dispatch > 1"  class="mt-5">
                <og-loot-table-infos
                    v-bind:title="'Départage des ressources'"
                    v-bind:table_type="'dispatch'"
                    v-bind:data_form="data_form"
                ></og-loot-table-infos>
            </div>
        </form>
    `
});

og_loot.component('og-loot-table-infos', {
    mixins:[ogLootMixins],
    props: ['data_form', 'table_type', 'title'],
    computed: {
        isTableLoot: function () {
            return this.table_type == 'loot' ? true : false;
        }
    },
    methods: {
        playerDebt: function (ress, k) {
            let dispatch = {
                metal: 0,
                crystal: 0,
                deuterium: 0
            };

            for (let ress in this.data_form.total_loot) {
                dispatch[ress] = parseInt(this.data_form.total_loot[ress] / this.data_form.dispatch);
            }

            return parseInt(ress - dispatch[k]);
        },
        getDebtClass: function (ress, k) {
            return this.playerDebt(ress, k) <= 0 ? 'text-danger' : '';
        }
    },
    template: `
        <table class="table table-dark">
            <thead>
                <tr>
                    <th colspan="5" class="text-center text-warning fs-5">{{title}}</th>
                </tr>
                <tr>
                    <th v-if="isTableLoot">#</th>
                    <th>Flotte</th>
                    <th class="text-center">Métal</th>
                    <th class="text-center">Cristal</th>
                    <th class="text-center">Deutérium</th>
                </tr>
            </thead>

            <tbody v-if="hasPlayers">
                <tr v-for="(player, k) in data_form.players">
                    <td v-if="isTableLoot">
                        <button
                            v-on:click.stop.prevent="deletePlayer(k)"
                            class="btn btn-sm btn-danger"
                        >
                            <span class="fa fa-trash"></span>
                        </button>
                    </td>
                    <td>{{player.name}}</td>
                    <td v-for="(ress, k) in player.ress" class="text-end">
                        <input
                            v-if="isTableLoot"
                            v-model="player.ress[k]"
                            type="number"
                            class="w-100 text-end bg-my-input-dark"
                        />
                        <span
                            v-else
                            class="text-end"
                            v-bind:class="getDebtClass(ress, k)"
                        >{{this.numberFormat(playerDebt(ress, k))}}</span>
                    </td>
                </tr>

                <tr v-if="isTableLoot" class="alert">
                    <td></td>
                    <td><b>Total</b></td>
                    <td v-for="total in data_form.total_loot" class="text-end">
                        {{numberFormat(total)}}
                    </td>
                </tr>
                <tr v-if="isTableLoot">
                    <td></td>
                    <td><b>Chacun</b></td>
                    <td v-for="total in data_form.total_loot" class="text-end">
                        {{numberFormat(parseInt(total / data_form.dispatch))}}
                    </td>
                </tr>
            </tbody>
        </table>
    `
});

og_loot.mount('#og_loot');
