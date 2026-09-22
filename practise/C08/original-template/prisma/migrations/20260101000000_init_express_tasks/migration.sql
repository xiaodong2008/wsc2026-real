-- CreateTable
-- IF NOT EXISTS so this migration can also be used to baseline a database that
-- already holds another project's tables (see docker-entrypoint.sh).
CREATE TABLE IF NOT EXISTS `express_tasks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `done` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
