+237699281439 
psswrd 1 

{
    "telephone":"+237699516606",
    "password":"test12345"
}

{
  "adresse": {
    "city": "Douala",
    "rue": "Carrefour Agip",
    "quater": "Bonamoussadi",
    "bp": "2345",
    "longitude": 4.052321,
    "latitude": 9.701245,
    "telephone": "+237670112233"
  },
  "name": "Pharmacie Renaissance",
  "description": "Officine moderne offrant médicaments et conseils.",
  "telephone": "+237699887744"
}




{
    "account": {
      "id": "31ff2ad2-1536-427a-bd31-ea9aa3f7c706",
      "telephone": "+237612345678",
      "email": "pharmacie2@gmail.com",
      "password": "pbkdf2_sha256$1000000$P2zPbRGbOKSk3rfp5IZkcx$KRXm3G5KGhFtqB3fGP6b0F82pTm64/83GXWSSpa6EHM=",
      "last_name": "pharmacie",
      "first_name": "2",
      "role": "PHARMACIST",
      "is_active": true
    },
    "officine": {
      "id": "990f43ec-64e0-4b7d-9204-07349005a060",
      "adresse": {
        "id": "b3dc1931-5a81-49b9-8f72-80c2afb3dd5a",
        "city": "Yaoundé",
        "country": null,
        "rue": "Carrefour Bastos",
        "quater": "Bastos",
        "bp": "2580",
        "telephone": "+237657901986"
      },
      "pharmacist_holder": {
        "id": "fa390e55-b365-40d6-8cc8-301a925b767c",
        "birthdate": null,
        "sexe": null,
        "profile_image": null,
        "poste": null,
        "created_at": "2025-12-03T07:44:24.286272Z",
        "user": {
          "id": "31ff2ad2-1536-427a-bd31-ea9aa3f7c706",
          "last_login": null,
          "telephone": "+237612345678",
          "email": "pharmacie2@gmail.com",
          "password": "pbkdf2_sha256$1000000$P2zPbRGbOKSk3rfp5IZkcx$KRXm3G5KGhFtqB3fGP6b0F82pTm64/83GXWSSpa6EHM=",
          "last_name": "pharmacie",
          "first_name": "2",
          "role": "PHARMACIST",
          "active": false,
          "is_staff": false,
          "is_active": true,
          "is_admin": false,
          "is_superuser": false,
          "created_at": "2025-12-03T07:44:24.284836Z",
          "groups": [],
          "user_permissions": []
        }
      },
      "name": "2PHARMACIE 2",
      "description": "TFJHRSHEDHEDWSHEDS",
      "telephone": "+237612345678",
      "is_activate": false,
      "created_at": "2025-12-03T07:42:30.436869Z",
      "created_by": null,
      "employe": [
        {
          "id": "fa390e55-b365-40d6-8cc8-301a925b767c",
          "birthdate": null,
          "sexe": null,
          "profile_image": null,
          "poste": null,
          "created_at": "2025-12-03T07:44:24.286272Z",
          "user": "31ff2ad2-1536-427a-bd31-ea9aa3f7c706"
        }
      ],
      "owner": []
    }
  }

Compte patient:  
+237657901999
123456789
fotsothomas2@gmail.com


######## API endpoints et exemples de retour ########
Pour récupérer la liste des commandes effectuées par un patient
{{baseURL}}/api/v1/officine/79cfe21a-a20b-4ef0-a20c-df080aa43f1c/list-officine-orders-pending/
79cfe21a-a20b-4ef0-a20c-df080aa43f1c c'est l'ID de la pharmacie qui est connectée que c'est sensé récupérer automatiquement

Exemple de retour:
[
    {
        "id": "378745be-bb4f-4ce7-be0e-46a3f423178f",
        "order": {
            "id": "85420bc1-7950-48a7-872d-5ff73a9ee653",
            "patient": {
                "id": "1285e78e-378f-4f1e-8ef8-5ba322528219",
                "last_name": null,
                "first_name": null
            },
            "prescription": "/markpedia-store.s3.amazonaws.commedia/prescription/1.png",
            "delivery_fee": "0.0000",
            "total_amount": "0.0000",
            "status": "PENDING",
            "payment_status": "UNPAID",
            "tax_amount": "0.0000",
            "created_at": "2025-12-12T09:20:37.614437Z",
            "updated_at": "2025-12-12T09:20:37.614526Z",
            "delivery_address": null
        },
        "pharmacy": {
            "id": "79cfe21a-a20b-4ef0-a20c-df080aa43f1c",
            "name": "PHARMACIE 1",
            "description": "",
            "telephone": "+237657901985",
            "is_activate": false,
            "created_at": "2025-12-02T18:46:47.030436Z",
            "adresse": "c28e1d91-a7de-452b-8793-8c1183034ecb",
            "pharmacist_holder": "d7469414-48b8-471a-9fe4-399576b21f0c",
            "created_by": null,
            "employe": [
                "d7469414-48b8-471a-9fe4-399576b21f0c"
            ],
            "owner": []
        },
        "sub_total": "0.0000",
        "status": "PENDING",
        "created_at": "2025-12-12T09:20:37.640473Z",
        "updated_at": "2025-12-12T09:20:37.640540Z",
        "delivery_driver": null,
        "validated_user": null
    }
]



Pour voir si la commande a des produits ou non:
{{baseURL}}/api/v1/officine-order/378745be-bb4f-4ce7-be0e-46a3f423178f/items-order/


Valider la commande:
{{baseURL}}/api/v1/officine-order/378745be-bb4f-4ce7-be0e-46a3f423178f/validate-officine-order/

pharmacie de Bessengue:
699887766
motdepasse
gedeonhakoua1@gmail.com