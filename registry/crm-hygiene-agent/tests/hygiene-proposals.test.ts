import { describe, expect, it } from "vitest";

import {
  proposeEnrich,
  proposeHygieneBatch,
  proposeNormalize,
} from "../agent/lib/hygiene";

describe("hygiene proposals", () => {
  it("does not copy phone numbers between contacts that only share an email domain", () => {
    const gmailDonor = {
      id: "1",
      email: "ada@gmail.com",
      phone: "+14155551212",
    };
    const gmailTarget = {
      id: "2",
      email: "charles@gmail.com",
    };
    const samePerson = {
      id: "3",
      email: "Ada@Example.com",
    };
    const samePersonDonor = {
      id: "4",
      email: "ada@example.com",
      phone: "+14155559876",
    };

    expect(proposeEnrich(gmailTarget, [gmailDonor, gmailTarget])).toBeNull();
    expect(
      proposeEnrich(samePerson, [samePerson, samePersonDonor])?.after.phone,
    ).toBe("+14155559876");
  });

  it("excludes merge-source contacts from normalize and enrich in the same batch", () => {
    const batch = proposeHygieneBatch({
      provider: "hubspot",
      scannedAt: "2026-09-09T08:00:00.000Z",
      records: [
        {
          id: "1",
          email: "Ava@Example.com",
          firstName: "ava",
          lastName: "NGUYEN",
        },
        {
          id: "2",
          email: "ava@example.com",
          firstName: "AVA",
          phone: "4155551212",
          company: "Acme",
        },
        {
          id: "3",
          email: "sam@example.com",
          firstName: "sam",
        },
      ],
    });

    const mergeSources = new Set(
      batch.proposals
        .filter((proposal) => proposal.kind === "dedupe")
        .map((proposal) => proposal.mergeRecordId)
        .filter((id): id is string => Boolean(id)),
    );
    expect(mergeSources.size).toBeGreaterThan(0);

    for (const sourceId of mergeSources) {
      expect(
        batch.proposals.some(
          (proposal) =>
            proposal.recordId === sourceId &&
            (proposal.kind === "normalize" || proposal.kind === "enrich"),
        ),
      ).toBe(false);
      expect(proposeNormalize({ id: sourceId, email: "ava@example.com", firstName: "AVA" })).not.toBeNull();
    }

    const primaryId = batch.proposals.find(
      (proposal) => proposal.kind === "dedupe",
    )?.recordId;
    expect(primaryId).toBeDefined();
    expect(
      batch.proposals.some(
        (proposal) => proposal.kind === "enrich" && proposal.recordId === "3",
      ),
    ).toBe(true);
    expect(
      batch.proposals.some(
        (proposal) =>
          proposal.kind === "normalize" && proposal.recordId === primaryId,
      ),
    ).toBe(true);
  });
});
