import React from 'react';
import { Warning as AllergyIcon } from '@mui/icons-material';
import ProgressiveDisclosure from '../ProgressiveDisclosure';
import AllergyChip, { sortAllergiesByPriority } from '.';

/**
 * AllergiesDisplay - Smart allergies component with progressive disclosure
 *
 * @param {Array} allergies - Array of allergy strings
 * @param {number} maxVisible - Maximum allergies to show in header (default: 2)
 * @param {Object} sx - Custom styling
 * @param {Function} onAllergyClick - Optional click handler for allergies
 */
const AllergiesDisplay = ({
  allergies = [],
  maxVisible = 2,
  sx = {},
  onAllergyClick,
}) => {
  // Sort allergies by priority (life-threatening first)
  const sortedAllergies = sortAllergiesByPriority(allergies);

  // Render allergy in header (compact)
  const renderAllergy = (allergy, index) => (
    <AllergyChip
      key={index}
      allergy={allergy}
      variant="compact"
      onClick={onAllergyClick ? () => onAllergyClick(allergy) : undefined}
    />
  );

  // Render allergy in popover (detailed)
  const renderExpandedAllergy = (allergy, index) => (
    <AllergyChip
      key={index}
      allergy={allergy}
      variant="detailed"
      showSeverity={true}
      onClick={onAllergyClick ? () => onAllergyClick(allergy) : undefined}
    />
  );

  return (
    <ProgressiveDisclosure
      items={sortedAllergies}
      maxVisible={maxVisible}
      renderItem={renderAllergy}
      renderExpandedItem={renderExpandedAllergy}
      label="Allergies"
      icon={<AllergyIcon sx={{ color: 'error.main', fontSize: 14 }} />}
      sx={sx}
    />
  );
};

export default AllergiesDisplay;

