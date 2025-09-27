CREATE TABLE "profiles" (
	"username" varchar(50) PRIMARY KEY NOT NULL,
	"bio" text DEFAULT '',
	"links" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_users_username_fk" FOREIGN KEY ("username") REFERENCES "public"."users"("username") ON DELETE cascade ON UPDATE no action;