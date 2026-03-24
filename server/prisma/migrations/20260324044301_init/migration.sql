-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_initials" TEXT NOT NULL,
    "branch" TEXT,
    "year" INTEGER,
    "semester" INTEGER,
    "regulation" TEXT NOT NULL DEFAULT 'R23',
    "roll_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "regulation" TEXT NOT NULL DEFAULT 'R23',
    "subject_code" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'regular',
    "credits" DOUBLE PRECISION NOT NULL,
    "is_theory" BOOLEAN NOT NULL DEFAULT true,
    "nptel_course_url" TEXT,
    "nptel_weeks_total" INTEGER NOT NULL DEFAULT 12,
    "nptel_deadline" TIMESTAMP(3),
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "subject_code" TEXT,
    "subject_name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "regulation" TEXT NOT NULL DEFAULT 'R23',
    "subject_code" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,
    "subject_type" TEXT NOT NULL,
    "unit_number" INTEGER NOT NULL,
    "unit_label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cloudinary_url" TEXT NOT NULL,
    "cloudinary_public_id" TEXT NOT NULL,
    "file_size_mb" DOUBLE PRECISION,
    "uploaded_by" TEXT NOT NULL,
    "is_important" BOOLEAN NOT NULL DEFAULT false,
    "important_message" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_roll_number_key" ON "users"("roll_number");

-- CreateIndex
CREATE INDEX "sessions_user_id_timestamp_idx" ON "sessions"("user_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "notes_branch_year_semester_regulation_subject_code_idx" ON "notes"("branch", "year", "semester", "regulation", "subject_code");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
