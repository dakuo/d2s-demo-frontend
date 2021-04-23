<template>
  <v-card @mouseover='hover=true' @mouseleave="hover=false">
    <v-card-title style="font-size: 100%; padding: 0.8em">
      <v-spacer/>
      <v-text-field
        v-if="slideContent.title == null || editing || processing"
        :disabled=processing
        label="Slide title"
        v-model="new_title"
        v-on:change="generateSlide"
        clearable
      ></v-text-field>
      <span v-else>{{ slideContent.title }}</span>
      <v-spacer/>
    </v-card-title>
    <v-card-text style="font-size: 85%; padding: 0 2em 2em 2em;">
      <div v-if="slideContent.title == null || editing || processing" style="height: 12.6rem;">
        <p v-if="processing">
          Generating slide content...
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </p>
      </div>
      <ul v-else style="height: 15rem; overflow-y: auto;">
        <li v-for="(bullet, i) in slideContent.content" :key="i">
          {{ bullet }}
        </li>
      </ul>
    </v-card-text>
    <v-icon v-show="hover" large class="drag-handle" style="position: absolute; left: .3em; bottom: .3em"> mdi-arrow-all </v-icon>
    <v-speed-dial v-show="hover" absolute bottom right direction="left" open-on-hover>
      <template v-slot:activator>
        <v-btn color="blue darken-2" dark small fab>
          <v-icon> mdi-menu </v-icon>
        </v-btn>
      </template>
      <v-btn fab dark x-small color="green" @click="editing = true">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn fab dark x-small color="red" @click="removeSlide">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-speed-dial>
  </v-card>
</template>

<script>
import localForage from "localforage";
import axios from "axios";

export default {
  props: {
    slideContent: Object,
    index: Number,
  },
  data: () => ({
    new_title: null,
    processing: false,
    editing: false,
    hover: false
  }),
  created() {
    this.new_title = this.slideContent.title;
  },
  methods: {
    generateSlide() {
      if (this.new_title) {
        console.log('here')
        this.processing = true;
        localForage.getItem("paper").then((paper) => {
          axios
            .post(`${process.env.VUE_APP_API_HOST}/generate_slide`, {
              title: this.new_title,
              ...paper,
            })
            .then((response) => {
              this.slideContent.content = response.data.answer;
              this.slideContent.title = this.new_title;

              this.$emit("input");
            })
            .catch((error) => {
              console.log({ error });
            })
            .finally(() => {
              this.processing = false;
            });
        });
      } else {
        this.processing = false;
      }

      this.editing = false;
    },
    removeSlide() {
      this.$emit("delete", this.index);
    },
  },
};
</script>

<style>

</style>