import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    version: "v0.0.1",
    title: "Dokumentasi API Acara",
    description: "Dokumentasi API Acara",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local Server",
    },
    {
      url: "https://back-end-acara-bice-nine.vercel.app/api",
      description: "Deploy Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      LoginRequest: {
        identifier: "nudra2026",
        password: "Nudra2025!",
      },
      RegisterRequest: {
        fullName: "Nudra Pradivta",
        username: "nudrapradivta",
        email: "pradivtanudra@gmail.com",
        password: "12341234",
        confirmPassword: "12341234",
      },
      ActivationRequest: {
        code: "abcdef",
      },
      CreateCategoryRequest: {
        name: "",
        description: "",
        icon: "",
      },
      CreateEventRequest: {
        name: "Amazing Event 2026",
        startDate: "2025-06-01T09:00:00Z",
        endDate: "2025-06-02T18:00:00Z",
        banner: "https://example.com/banner-image.jpg",
        category: "681634e287a2f491dd08da95",
        isFeatured: true,
        isOnline: false,
        isPublish: false,
        description: "This is an exciting event happening online.",
        createdBy: "681358311ea793b0e912911b",
        slug: "amazing-event-2026",
        location: {
          region: 3273180003,
          coordinates: [6.6, 10.1],
        },
      },
      RemoveMediaRequest: {
        fileUrl: "",
      },
    },
  },
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["../routes/api.ts"];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
