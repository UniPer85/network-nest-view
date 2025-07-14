export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ha_devices: {
        Row: {
          configuration_url: string | null
          connections: Json | null
          created_at: string
          device_id: string
          device_name: string
          device_type: string
          hw_version: string | null
          id: string
          identifiers: Json
          manufacturer: string | null
          model: string | null
          sw_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          configuration_url?: string | null
          connections?: Json | null
          created_at?: string
          device_id: string
          device_name: string
          device_type: string
          hw_version?: string | null
          id?: string
          identifiers: Json
          manufacturer?: string | null
          model?: string | null
          sw_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          configuration_url?: string | null
          connections?: Json | null
          created_at?: string
          device_id?: string
          device_name?: string
          device_type?: string
          hw_version?: string | null
          id?: string
          identifiers?: Json
          manufacturer?: string | null
          model?: string | null
          sw_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ha_entities: {
        Row: {
          created_at: string
          device_class: string | null
          device_id: string
          enabled: boolean
          entity_id: string
          entity_name: string
          entity_type: string
          icon: string | null
          id: string
          state_class: string | null
          unit_of_measurement: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_class?: string | null
          device_id: string
          enabled?: boolean
          entity_id: string
          entity_name: string
          entity_type?: string
          icon?: string | null
          id?: string
          state_class?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_class?: string | null
          device_id?: string
          enabled?: boolean
          entity_id?: string
          entity_name?: string
          entity_type?: string
          icon?: string | null
          id?: string
          state_class?: string | null
          unit_of_measurement?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ha_entities_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "ha_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      homeassistant_config: {
        Row: {
          api_key: string
          created_at: string
          enabled: boolean
          ha_instance_name: string
          ha_instance_url: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          enabled?: boolean
          ha_instance_name: string
          ha_instance_url?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          enabled?: boolean
          ha_instance_name?: string
          ha_instance_url?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitored_devices: {
        Row: {
          api_key: string | null
          created_at: string
          device_type: Database["public"]["Enums"]["device_type"]
          host: string
          id: string
          is_active: boolean | null
          name: string
          password: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          device_type: Database["public"]["Enums"]["device_type"]
          host: string
          id?: string
          is_active?: boolean | null
          name: string
          password?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          device_type?: Database["public"]["Enums"]["device_type"]
          host?: string
          id?: string
          is_active?: boolean | null
          name?: string
          password?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      monitored_services: {
        Row: {
          check_interval: number | null
          created_at: string
          expected_response: string | null
          host: string
          id: string
          is_active: boolean | null
          name: string
          path: string | null
          port: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          timeout: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_interval?: number | null
          created_at?: string
          expected_response?: string | null
          host: string
          id?: string
          is_active?: boolean | null
          name: string
          path?: string | null
          port?: number | null
          service_type: Database["public"]["Enums"]["service_type"]
          timeout?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_interval?: number | null
          created_at?: string
          expected_response?: string | null
          host?: string
          id?: string
          is_active?: boolean | null
          name?: string
          path?: string | null
          port?: number | null
          service_type?: Database["public"]["Enums"]["service_type"]
          timeout?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_ha_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      device_type:
        | "unifi_controller"
        | "unifi_switch"
        | "unifi_access_point"
        | "unifi_gateway"
        | "generic"
      service_type:
        | "http"
        | "https"
        | "tcp"
        | "udp"
        | "ping"
        | "dns"
        | "docker_server"
        | "docker_container"
        | "sql"
        | "mqtt"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      device_type: [
        "unifi_controller",
        "unifi_switch",
        "unifi_access_point",
        "unifi_gateway",
        "generic",
      ],
      service_type: [
        "http",
        "https",
        "tcp",
        "udp",
        "ping",
        "dns",
        "docker_server",
        "docker_container",
        "sql",
        "mqtt",
      ],
    },
  },
} as const
