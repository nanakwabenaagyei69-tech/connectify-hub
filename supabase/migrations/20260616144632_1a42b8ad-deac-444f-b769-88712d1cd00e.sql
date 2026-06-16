
DO $$
DECLARE
  demo_id uuid;
BEGIN
  SELECT id INTO demo_id FROM auth.users WHERE email = 'demo@links.app';

  IF demo_id IS NULL THEN
    demo_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', demo_id, 'authenticated', 'authenticated',
      'demo@links.app', crypt('DemoLinks2026!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"username":"demo","full_name":"Demo Explorer"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), demo_id,
      jsonb_build_object('sub', demo_id::text, 'email', 'demo@links.app'),
      'email', demo_id::text, now(), now(), now());
  END IF;

  INSERT INTO public.profiles (id, username, display_name, bio, topics)
  VALUES (demo_id, 'demo', 'Demo Explorer', 'Exploring Links ✨', ARRAY['Music','Tech','Art','Gaming'])
  ON CONFLICT (id) DO UPDATE
    SET display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        topics = EXCLUDED.topics;
END $$;
