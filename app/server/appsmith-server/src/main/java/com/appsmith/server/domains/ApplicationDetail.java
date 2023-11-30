package com.appsmith.server.domains;

import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.Type;

@Getter
@Setter
@ToString
@NoArgsConstructor
@Entity
public class ApplicationDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Application.AppPositioning appPositioning;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Application.NavigationSetting navigationSetting;
}
