<template>
  <v-app>
    <v-app-bar app color="primary white--text">
      <h2>Document to Slides</h2>

      <v-spacer></v-spacer>

      <v-btn
        href=""
        target="_blank"
        text
        class="white--text"
      >
        <span class="mr-2">Paper</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-form @submit.prevent="uploadPaper" ref="form">
          Try our algorithm by uploading a paper in pdf format. Our system does not store any user data in the backend. The data are stored in your browser's database.
          <v-file-input
            style="width: 20em"
            accept="application/pdf"
            label="PDF file"
            :rules="[(v) => !!v || 'Please select a PDF file to upload.']"
            v-model="file"
          ></v-file-input>
          <p>
            <v-btn type="submit" color="primary" :disabled="processing" class="mr-2"
              >Submit</v-btn
            >
            <span v-show="processing">
              Processing. This may take a few minutes.<v-progress-circular
                indeterminate
                color="primary"
              ></v-progress-circular
            ></span>
            <span v-if="!processing && filename">
              <span style="color: green">{{ filename }}</span> has been processed, and ready for creating slides.
            </span>
          </p>
        </v-form>

        <v-row>
          <v-col>
          <v-btn
            color="green"
            class="mr-3 white--text"
            :disabled="slides.length == 0"
            @click="download"
            >Download Slides<v-icon>mdi-download</v-icon></v-btn
          >
          <v-btn
            color="red white--text"
            :disabled="slides.length == 0"
            @click="clear"
            >Delete all Slides<v-icon>mdi-delete</v-icon></v-btn
          >
          </v-col>
        </v-row>

        <draggable
          v-model="slides"
          @end="saveSlides"
          class="row wrap"
          draggable=".slide"
          handle=".drag-handle"
        >
          <v-col
            md="6"
            cols="12"
            v-for="(slide, index) in slides"
            :key="slide.key"
            class="slide"
          >
            <Slide
              :slideContent="slide"
              :index="index"
              @input="generateSlide"
              v-on:delete="deleteSlide"
            />
          </v-col>
          <v-col cols="6">
            <v-card
              style="
                height: 20.3rem;
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <v-btn color="success" large @click="addSlide">
                <v-icon>mdi-plus-circle</v-icon>
                Add a slide</v-btn
              >
            </v-card>
          </v-col>
        </draggable>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import axios from "axios";
import Slide from "./components/Slide";
import localForage from "localforage";
import draggable from "vuedraggable";

export default {
  name: "App",

  components: {
    Slide,
    draggable,
  },

  data: () => ({
    file: null,
    processing: false,
    filename: null,
    slides: [],
  }),

  created() {
    localForage.getItem("filename").then((name) => {
      this.filename = name;
    });
    localForage.getItem("slides").then((slides) => {
      if (slides) {
        this.slides = slides;
      } else {
        this.slides = [];
      }
    });
  },

  methods: {
    uploadPaper() {
      this.$refs.form.validate();
      if (this.file) {
        let formData = new FormData();

        formData.append("file", this.file, this.file.name);
        this.processing = true;

        axios
          .post(`${process.env.VUE_APP_API_HOST}/encode_paper`, formData)
          .then((response) => {
            localForage.setItem("paper", response.data);
            localForage.setItem("filename", this.file.name).then(() => {
              this.filename = this.file.name;
            });
            localForage.setItem("slides", []);
          })
          .catch((error) => {
            console.log({ error });
          })
          .finally(() => {
            this.processing = false;
          });
      } else {
        console.log("there are no files.");
      }
    },
    generateSlide() {
      localForage.setItem("slides", this.slides);
    },
    deleteSlide(index) {
      this.slides.splice(index, 1);
      localForage.setItem("slides", this.slides);
    },
    addSlide() {
      this.slides.push({ title: null, key: "key_" + Date.now() });
      localForage.setItem("slides", this.slides);
    },
    saveSlides() {
      localForage.setItem("slides", this.slides);
    },
    download() {
      axios.post(
        `${process.env.VUE_APP_API_HOST}/download_slides`,
        { title: this.name, slides: this.slides },
        { responseType: "blob" }
      ).then (response => {
        const type = response.headers['content-type']
        const blob = new Blob([response.data], { type: type, encoding: 'UTF-8' })
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = this.name+'.pptx'
        link.click()
      });
    },
    clear() {
      this.slides = [];
      localForage.setItem("slides", []);
    }
  },

  computed: {
    name() {
      return this.filename.split(".")[0]
    }
  }
};
</script>
