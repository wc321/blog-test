package me.woochan.my_blog.service;

import lombok.RequiredArgsConstructor;
import me.woochan.my_blog.dto.UploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.UUID;

@Profile("!local")
@Service
@RequiredArgsConstructor
public class AwsS3Service implements FileStorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Override
    public UploadResponse store(byte[] bytes, String filename) {
        String ext = filename.contains(".")
                ? filename.substring(filename.lastIndexOf('.') + 1).toLowerCase()
                : "png";

        String contentType = switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/png";
        };

        String key = "uploads/" + UUID.randomUUID() + "." + ext;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(bytes));

        String url = s3Client.utilities()
                .getUrl(b -> b.bucket(bucket).key(key))
                .toExternalForm();

        return new UploadResponse(url);
    }
}
