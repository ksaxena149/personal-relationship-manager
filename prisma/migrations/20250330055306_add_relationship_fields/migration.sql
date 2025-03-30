-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "customInteractionDays" INTEGER,
ADD COLUMN     "lastInteractionDate" TIMESTAMP(3),
ADD COLUMN     "relationshipType" TEXT;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "isInteraction" BOOLEAN NOT NULL DEFAULT false;
